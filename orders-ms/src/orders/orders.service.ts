import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PrismaClient } from '@prisma/client';
import { NATS_SERVICE } from 'src/config/services';
import { ChangeOrderStatusDto, CreateOrderDto, PaidOrderDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interface/order-with-products.interface';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly Logger = new Logger('OrdersService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.Logger.log('Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // 1. Confirmar los ids de los productos.
      const productIds = createOrderDto.items.map((item) => item.product_id);
      // const ids = [5,6];
      const products: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productIds),
      );

      ///*********************************** */
      // Imprimir los IDs de los productos encontrados
      console.log(
        'Product IDs impresos:',
        products.map((product) => product.product_id),
      ); // Aquí estamos imprimiendo los ids

      if (products.length === 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `No products found for the given IDs: ${productIds.join(', ')}`,
        });
      }
      //*********************** */

      // 2. Cálculos de los valores  (LOS TOTALES)
      const total_amount = createOrderDto.items.reduce((acc, orderItem) => {
        // const price = products.find(
        //   (product) => product.product_id === orderItem.product_id,
        // ).price;

        // return price * orderItem.quantity;
        // //return acc + (+price * orderItem.quantity);  // Convertir Decimal a número con "+"

        // Convertir Decimal a number con parseFloat
        const price = parseFloat(
          products
            .find((product) => product.product_id === orderItem.product_id)
            .price.toString(),
        );

        return acc + price * orderItem.quantity;
      }, 0);

      const total_items = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      // 3.  Crear una transacción de BD
      const order = await this.order.create({
        data: {
          total_amount: total_amount,
          total_items: total_items,
          OrderItem: {
            createMany: {
              // data: createOrderDto.items.map((orderItem) => ({
              //   price: products.find(
              //     (product) => product.product_id === orderItem.product_id,
              //   ).price,
              //   product_id: orderItem.product_id,
              //   quantity: orderItem.quantity,
              // })),

              data: createOrderDto.items.map((orderItem) => {
                const price = parseFloat(
                  products
                    .find(
                      (product) => product.product_id === orderItem.product_id,
                    )
                    .price.toString(),
                );
                return {
                  price: price,
                  product_id: orderItem.product_id,
                  quantity: orderItem.quantity,
                };
              }),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              product_id: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          //price: orderItem.price,
          price: parseFloat(orderItem.price.toString()), // Aseguramos la conversión de Decimal a number
          product_name: products.find(
            (product) => product.product_id === orderItem.product_id,
          ).product_name,
        })),
      };
      // } catch (error) {
      //   throw new RpcException({
      //     status: HttpStatus.BAD_REQUEST,
      //     message: 'Check logs',
      //   });
      // }
    } catch (error) {
      console.error('Error in create order:', error); // Agregar log detallado del error
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Error creating order: ${error.message || 'Unknown error'}`,
      });
    }
  }

  async findAll(orderPaginatioDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginatioDto.status,
      },
    });

    const currentPage = orderPaginatioDto.page;
    const perPage = orderPaginatioDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginatioDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            product_id: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    // 2. Obtener los IDs de los productos
    const productIds = order.OrderItem.map((orderItem) => orderItem.product_id);

    // 3. Consultar la información de los productos desde el servicio de productos
    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, productIds),
    );
    this.Logger.log(`Products received: ${JSON.stringify(products)}`);

    // 4. Combinar la información de los productos con los ítems de la orden
    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        product_name: products.find(
          (product) => product.product_id === orderItem.product_id,
        ).product_name,
      })),
    };
  }

  async changeStatus(changeOrderSatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderSatusDto;

    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: {
        status: status,
      },
    });
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.client.send('create.payment.session', {
        order_id: order.id,
        currency: 'usd',
        items: order.OrderItem.map((item) => ({
          product_name: item.product_name,
          //price: item.price,
          price: parseFloat(item.price.toString()), // Para asegurar que sea un número
          quantity: item.quantity,
        })),
      }),
    );

    return paymentSession;
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    this.Logger.log('Order Paid');
    this.Logger.log(paidOrderDto);

    const order = await this.order.update({
      where: { id: paidOrderDto.order_id },
      data: {
        status: 'PAID',
        paid: true,
        paid_at: new Date(),
        stripe_charge_id: paidOrderDto.stripe_payment_id,

        // La relación
        OrderReceipt: {
          create: {
            receipt_url: paidOrderDto.receipt_url,
          },
        },
      },
    });
    return { ...order };
  }
}
