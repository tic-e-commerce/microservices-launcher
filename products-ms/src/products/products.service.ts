import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { ProductsStatusList } from './enum/products.enum';
import { ReservationItemDto } from './dto/reservation.dto';
import { ProductQuantityDto } from './dto/validate-products-request.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  // Tarea programada: Ejecutar cada minuto
  @Cron('*/1 * * * *') // Expresión CRON: cada minuto
  async handleCron() {
    this.logger.log(
      'Executing scheduled task to update expired reservations...',
    );
    await this.updateExpiredReservations();
  }

  async create(createProductDto: CreateProductDto) {
    console.log('createProductDto', createProductDto);
    try {
      const product = await this.product.create({
        data: {
          ...createProductDto,
          creation_date: new Date(),
          status: createProductDto.status || 'ACTIVE',
        },
      });
      return product;
    } catch (error) {
      this.logger.error('Error creating product:', error);
      throw new RpcException('Error creating product');
    }
  }

  async findAll() {
    try {
      const products = await this.product.findMany();
      return products;
    } catch (error) {
      this.logger.error('Error fetching products:', error);
      throw new RpcException('Error fetching products');
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.product.findUnique({
        where: { product_id: id },
      });
      if (!product) {
        throw new RpcException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error fetching product with ID ${id}:`, error);
      throw new RpcException('Error fetching product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      if (!updateProductDto) {
        throw new Error('No data provided for update');
      }

      const status = updateProductDto.status;
      if (status && !ProductsStatusList.includes(status)) {
        throw new RpcException(`Invalid status value: ${status}`);
      }

      const updatedProduct = await this.product.update({
        where: { product_id: id },
        data: {
          ...updateProductDto,
          update_date: new Date(),
        },
      });
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Error updating product with ID ${id}:`, error);
      throw new RpcException('Error updating product');
    }
  }

  async remove(id: number) {
    try {
      const deletedProduct = await this.product.delete({
        where: { product_id: id },
      });
      return deletedProduct;
    } catch (error) {
      this.logger.error(`Error deleting product with ID ${id}:`, error);
      throw new RpcException('Error deleting product');
    }
  }

  async validateProducts(productQuantityDto: ProductQuantityDto[]) {
    const quantities = productQuantityDto.reduce(
      (acc, item) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
        return acc;
      },
      {} as Record<number, number>,
    );

    const ids = Object.keys(quantities).map(Number);
    const products = await this.product.findMany({
      where: { product_id: { in: ids } },
      select: { product_id: true, stock: true },
    });

    if (products.length !== ids.length) {
      const missingIds = ids.filter(
        (id) => !products.some((product) => product.product_id === id),
      );
      throw new RpcException({
        message: `Product not found: ${missingIds.join(', ')}`,
        status: 400,});
    }

    for (const product of products) {
      const requested = quantities[product.product_id];
      if (product.stock < requested) {
        throw new RpcException({
          message: `Insufficient stock for product ${product.product_id}. Available: ${product.stock}, Requested: ${requested}`,
          status: 400,});
      }
    }
    return products;
  }

  async updateProductStock(
    cartItems: { product_id: number; quantity: number }[],
  ) {
    try {
      return await this.$transaction(async (prisma) => {
        const products = await this.validateProducts(cartItems);
        return Promise.all(
          cartItems.map((item) => {
            return prisma.product.update({
              where: { product_id: item.product_id },
              data: { stock: { decrement: item.quantity } },});
          }),
        );
      });
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: 'Error updating product stock',
      });
    }
  }

  // async updateExpiredReservations() {
  //   try {
  //     const now = new Date();
  //     const expiredReservations = await this.reservation.findMany({
  //       where: { expires_at: { lte: now }, status: 'ACTIVE' },
  //     });

  //     if (expiredReservations.length) {
  //       await this.$transaction(async (prisma) => {
  //         for (const reservation of expiredReservations) {
  //           await prisma.reservation.update({
  //             where: { reservation_id: reservation.reservation_id },
  //             data: { status: 'EXPIRED' }, //RESERVAS
  //           });

  //           await prisma.product.update({
  //             where: { product_id: reservation.product_id },
  //             data: { stock: { increment: reservation.quantity } },
  //           });

  //           const activeReservations = await prisma.reservation.findMany({
  //             where: {
  //               order_id: reservation.order_id,
  //               status: 'ACTIVE',
  //             },
  //           });

  //           if (activeReservations.length === 0) {
  //             await this.client.emit('order.expired', {
  //               order_id: reservation.order_id,});}
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     throw new RpcException('Error updating expired reservations.');
  //   }
  // }

  async updateExpiredReservations() {
    try {
      const now = new Date();
      const expiredReservations = await this.reservation.findMany({
        where: { expires_at: { lte: now }, status: 'ACTIVE' },
      });
  
      if (expiredReservations.length) {
        const expiredOrders = new Set<string>();

        await this.$transaction(
          expiredReservations.flatMap((reservation) => [
            this.reservation.update({
              where: { reservation_id: reservation.reservation_id },
              data: { status: 'EXPIRED' },
            }),
            this.product.update({
              where: { product_id: reservation.product_id },
              data: { stock: { increment: reservation.quantity } },
            }),
          ]),
        );
  
        for (const reservation of expiredReservations) {
          const activeReservations = await this.reservation.findMany({
            where: {
              order_id: reservation.order_id,
              status: 'ACTIVE',
            },
          });
  
          if (activeReservations.length === 0) {
            expiredOrders.add(reservation.order_id);
          }
        }
  
        for (const order_id of expiredOrders) {
          await this.client.emit('order.expired', { order_id });
        }
      }
    } catch (error) {
      this.logger.error(
        `Error updating expired reservations: ${error.message}`,
        error.stack,
      );
      throw new RpcException('Error updating expired reservations.');
    }
  }

  async createReservations(reservations: ReservationItemDto[]) {
    try {
      await this.validateProducts(reservations);
  
      const existingReservations = await this.reservation.findMany({
        where: {
          OR: reservations.map(({ user_id, product_id, order_id }) => ({
            user_id,
            product_id,
            order_id,
            status: 'ACTIVE',
          })),
        },
      });
  
      const reservationMap = new Map(
        existingReservations.map((res) => [`${res.user_id}-${res.product_id}-${res.order_id}`, res])
      );
  
      const updates: any[] = [];
      const inserts: any[] = [];
  
      for (const { user_id, product_id, quantity, order_id } of reservations) {
        const key = `${user_id}-${product_id}-${order_id}`;
        const existingReservation = reservationMap.get(key);
  
        if (existingReservation) {
          updates.push({
            reservation_id: existingReservation.reservation_id,
            quantity: existingReservation.quantity + quantity,
          });
        } else {
          inserts.push({
            user_id,
            product_id,
            order_id,
            quantity,
            status: 'ACTIVE',
            expires_at: new Date(Date.now() + 3 * 60 * 1000),
          });
        }
      }
  
      await this.$transaction(async (prisma) => {
        if (updates.length > 0) {
          await Promise.all(
            updates.map(({ reservation_id, quantity }) =>
              prisma.reservation.update({
                where: { reservation_id },
                data: { quantity },
              })
            )
          );
        }
  
        if (inserts.length > 0) {
          await prisma.reservation.createMany({ data: inserts });
        }
      });
  
      await this.updateProductStock(reservations);
  
      return { message: 'Reservations created successfully.' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error creating reservations: ${error.message}`,
      });
    }
  }
  
  async completeReservations(
    items: { product_id: number; quantity: number; order_id: string }[],
  ) {
    try {
      await this.$transaction(async (prisma) => {
        for (const { product_id, order_id } of items) {
          const reservation = await prisma.reservation.findFirst({
            where: { product_id, order_id, status: 'ACTIVE' },
          });
          if (!reservation) {
            throw new RpcException(
              `Active reservation not found for product ${product_id} in order ${order_id}.`,
            );
          }
          await prisma.reservation.update({
            where: { reservation_id: reservation.reservation_id },
            data: { status: 'COMPLETED' },
          });
        }
      });

      return { message: 'Reservations completed successfully.' };
    } catch (error) {
      throw new RpcException(`Error completing reservations: ${error.message}`);
    }
  }

  async cancelReservations(reservations: ReservationItemDto[]) {
    try {
      await this.$transaction(async (prisma) => {
        for (const { product_id, user_id } of reservations) {
          const reservation = await prisma.reservation.findFirst({
            where: { product_id, user_id, status: 'ACTIVE' },
          });

          if (!reservation) {
            throw new RpcException(
              `No active reservation found for product ${product_id} and user ${user_id}`,
            );
          }

          await prisma.reservation.update({
            where: { reservation_id: reservation.reservation_id },
            data: { status: 'CANCELLED' },});

          await prisma.product.update({
            where: { product_id },
            data: { stock: { increment: reservation.quantity } },
          });
        }
      });

      return { message: 'Reservas canceladas correctamente.' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error al cancelar reservas: ${error.message}`,
      });
    }
  }

  async handleOrderProcessed(data: {
    order_id: string;
    user_id: number;
    items: { product_id: number; quantity: number; order_id: string }[];
  }) {
    return this.completeReservations(data.items);
  }

  async getActiveReservations(reservations: ReservationItemDto[]) {
    try {
      const activeReservations = await this.$transaction(async (prisma) => {
        const result = [];

        for (const { product_id, user_id } of reservations) {
          const reservation = await prisma.reservation.findFirst({
            where: {
              product_id,
              user_id,
              status: 'ACTIVE',
            },
          });

          if (reservation) {
            result.push(reservation);
          }
        }
        return result;
      });

      if (activeReservations.length === 0) {
        throw new RpcException('No se encontraron reservas activas.');
      }
      return activeReservations;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error al obtener reservas activas: ${error.message}`,
      });
    }
  }
}