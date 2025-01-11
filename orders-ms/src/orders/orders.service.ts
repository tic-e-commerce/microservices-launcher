import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Prisma, PrismaClient } from '@prisma/client';
import { NATS_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interface/order-with-products.interface';
import { CreateOrderDto, PaidOrderDto, UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { user_id } = createOrderDto;

    try {
      const cartItems = await firstValueFrom(
        this.client.send('findAllCart', { user_id }),
      );

      if (!cartItems || cartItems.length === 0) {
        throw new RpcException({
          status: 400,
          message: 'Usuario no tiene productos en el carrito.',
        });
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.price),
        0,
      );
      const totalItems = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const order = await this.$transaction(async (prisma) => {
        const newOrder = await prisma.order.create({
          data: {
            user_id,
            total_amount: totalAmount,
            total_items: totalItems,
            order_items: {
              create: cartItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                product_name: item.product_name,
                image_url: item.image_url,
              })),
            },
          },
          include: { order_items: true },
        });
        return newOrder;
      });

      const reservations = order.order_items.map((item) => ({
        product_id: item.product_id,
        order_id: order.order_id,
        quantity: item.quantity,
        user_id,
      }));

      await firstValueFrom(
        this.client.send('create_reservations', { reservations }),
      );

      await this.client.emit('order.created', {
        order_id: order.order_id,
        user_id,
        total_amount: order.total_amount,
        total_items: order.total_items,
      });

      return order;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error creando la orden: ${error.message}`,
      });
    }
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.client.send('create.payment.session', {
        order_id: order.order_id,
        currency: 'usd',
        items: order.OrderItem.map((item) => ({
          ...item,
        })),
      }),
    );
    return paymentSession;
  }

  async findOrderById(order_id: string, includeOrderItems = true) {
    const order = await this.order.findUnique({
      where: { order_id },
      include: includeOrderItems ? { order_items: true } : undefined, //Operación ternaria
    });

    if (!order) {
      this.logger.warn(`Order not found: ${order_id}`);
      throw new RpcException(`Order with ID ${order_id} not found.`);
    }
    return order;
  }

  async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto) {
    const { order_id, status } = updateOrderStatusDto;

    const updatedOrder = await this.order.update({
      where: { order_id },
      data: { status },
    });

    await this.client.emit('order.status.updated', {
      order_id: updatedOrder.order_id,
      status: updatedOrder.status,
    });

    return updatedOrder;
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    this.logger.log(paidOrderDto);

    const order = await this.order.findUnique({
      where: { order_id: paidOrderDto.order_id },
      include: { order_items: true },
    });

    if (!order) {
      throw new RpcException({
        status: 404,
        message: `Orden con ID ${paidOrderDto.order_id} no encontrada.`,
      });
    }

    const activeReservations = await firstValueFrom(
      this.client.send(
        'get_active_reservations',
        order.order_items.map((item) => ({
          product_id: item.product_id,
          user_id: order.user_id,
          quantity: item.quantity,
          order_id: item.order_id,
        })),
      ),
    );

    if (activeReservations.length !== order.order_items.length) {
      throw new RpcException({
        status: 400,
        message:'Una o más reservas han expirado. No se puede procesar el pago.',
      });
    }

    const updatedOrder = await this.order.update({
      where: { order_id: paidOrderDto.order_id },
      data: {
        status: 'PAID',
        paid: true,
        paid_at: new Date(),
        stripe_charge_id: paidOrderDto.stripe_payment_id,
        order_receipt: {
          create: {
            receipt_url: paidOrderDto.receipt_url,
          },
        },
      },
      include: { order_items: true },
    });

    // Emitir evento para procesar la orden
    await this.client.emit('order.processed', {
      order_id: updatedOrder.order_id,
      user_id: updatedOrder.user_id,
      items: updatedOrder.order_items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });
    return updatedOrder;
  }

  async cancelOrder(order_id: string) {
    const order = await this.findOrderById(order_id, true);

    const invalidStatuses = {
      EXPIRED: 'No se puede cancelar una orden expirada.',
      PAID: 'No se puede cancelar una orden ya pagada.',
    };

    if (invalidStatuses[order.status]) {
      throw new RpcException({
        status: 400,
        message: invalidStatuses[order.status],
      });
    }

    try {
      const reservationsToCancel = order.order_items.map((item) => ({
        product_id: item.product_id,
        user_id: order.user_id,
        quantity: item.quantity,

        order_id: item.order_id,
      }));

      await firstValueFrom(
        this.client.send('cancel_reservations', reservationsToCancel),
      );

      await this.order.update({
        where: { order_id },
        data: { status: 'CANCELLED' },
      });

      return { message: 'Orden cancelada correctamente.' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error al cancelar la orden: ${error.message}`,
      });
    }
  }

  async handleOrderExpired(order_id: string) {
    try {
      const order = await this.findOrderById(order_id, false); 

      if (order.status === 'PAID') {
        throw new RpcException({
          status: 400,
          message: 'No se puede marcar como expirada una orden ya pagada.',
        });
      }

      await this.order.update({
        where: { order_id },
        data: { status: 'EXPIRED' },
      });
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error al marcar la orden como expirada: ${error.message}`,
      });
    }
  }
}