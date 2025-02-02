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

  // async createOrder(createOrderDto: CreateOrderDto) {
  //   const { user_id } = createOrderDto;
  //   try {
  //     const [cartResponse] = await Promise.all([
  //       firstValueFrom(this.client.send('cart.items.get', { user_id })),
  //       this.$connect(),
  //     ]);
  
  //     const cartItems = cartResponse.cart;
  
  //     if (!cartItems || cartItems.length === 0) {
  //       throw new RpcException({
  //         status: 400,
  //         message: 'The user has no products in the cart.',
  //       });
  //     }
  
  //     const shippingDetails = {
  //       STANDARD: 3.99,
  //       EXPRESS: 7.99,
  //       STORE: 0.0,
  //     };
  
  //     const shipping_method = cartResponse.shipping_method || 'STANDARD';
  //     const shipping_cost = shippingDetails[shipping_method];
  
  //     const totalAmount = cartItems.reduce(
  //       (sum, item) => sum + item.quantity * parseFloat(item.price),
  //       0,
  //     );
  //     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  //     const finalAmount = totalAmount + shipping_cost;
  
  //     const orderPromise = this.$transaction(async (prisma) => {
  //       const newOrder = await prisma.order.create({
  //         data: {
  //           user_id,
  //           total_amount: finalAmount,
  //           total_items: totalItems,
  //         },
  //       });
  
  //       await prisma.order_item.createMany({
  //         data: cartItems.map((item) => ({
  //           order_id: newOrder.order_id,
  //           product_id: item.product_id,
  //           quantity: item.quantity,
  //           price: parseFloat(item.price),
  //           product_name: item.product_name,
  //           image_url: item.image_url,
  //         })),
  //       });
  
  //       return newOrder;
  //     });
  
  //     const { order_id } = await orderPromise;
  
  //     const fullOrder = await this.order.findUnique({
  //       where: { order_id },
  //       include: { order_items: true },
  //     });
  
  //     const reservations = cartItems.map((item) => ({
  //       product_id: item.product_id,
  //       order_id,
  //       quantity: item.quantity,
  //       user_id,
  //     }));
  
  //     const reservationsPromise = firstValueFrom(
  //       this.client.send('create_reservations', { reservations }),
  //     );
  
  //     await reservationsPromise;
  
  //     this.client.emit('order.created', {
  //       order_id,
  //       user_id,
  //       total_amount: fullOrder.total_amount,
  //       total_items: fullOrder.total_items,
  //       order_items: fullOrder.order_items,
  //     });
  
  //     return fullOrder;
  //   } catch (error) {
  //     throw new RpcException({
  //       status: 400,
  //       message: error.message,
  //     });
  //   }
  // }

  // //**********************************************
  // async createOrder(createOrderDto: CreateOrderDto) {
  //   const { user_id } = createOrderDto;
  //   try {
  //     const cartPromise = firstValueFrom(this.client.send('cart.items.get', { user_id }));
  
  //     await this.$connect();
  
  //     const cartResponse = await cartPromise;
  //     const cartItems = cartResponse.cart;
  
  //     if (!cartItems || cartItems.length === 0) {
  //       throw new RpcException({
  //         status: 400,
  //         message: 'The user has no products in the cart.',
  //       });
  //     }
  
  //     const shippingDetails = {
  //       STANDARD: 3.99,
  //       EXPRESS: 7.99,
  //       STORE: 0.0,
  //     };
  
  //     const shipping_method = cartResponse.shipping_method || 'STANDARD';
  //     const shipping_cost = shippingDetails[shipping_method];
  
  //     const totalAmount = cartItems.reduce(
  //       (sum, item) => sum + item.quantity * parseFloat(item.price),
  //       0,
  //     );
  //     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  //     const finalAmount = totalAmount + shipping_cost;
  
  //     const orderPromise = this.$transaction(async (prisma) => {
  //       const newOrder = await prisma.order.create({
  //         data: {
  //           user_id,
  //           total_amount: finalAmount,
  //           total_items: totalItems,
  //         },
  //       });
  
  //       await prisma.order_item.createMany({
  //         data: cartItems.map((item) => ({
  //           order_id: newOrder.order_id,
  //           product_id: item.product_id,
  //           quantity: item.quantity,
  //           price: parseFloat(item.price),
  //           product_name: item.product_name,
  //           image_url: item.image_url,
  //         })),
  //       });
  
  //       return newOrder;
  //     });
  
  //     const { order_id } = await orderPromise;
  
  //     const reservations = cartItems.map((item) => ({
  //       product_id: item.product_id,
  //       order_id,
  //       quantity: item.quantity,
  //       user_id,
  //     }));
  
  //     const reservationsPromise = firstValueFrom(
  //       this.client.send('create_reservations', { reservations }),
  //     );
  
  //     const fullOrderPromise = this.order.findUnique({
  //       where: { order_id },
  //       include: { order_items: true },
  //     });
  
  //     const [fullOrder] = await Promise.all([fullOrderPromise, reservationsPromise]);
  
  //     this.client.emit('order.created', {
  //       order_id,
  //       user_id,
  //       total_amount: fullOrder.total_amount,
  //       total_items: fullOrder.total_items,
  //       order_items: fullOrder.order_items,
  //     });
  
  //     return fullOrder;
  //   } catch (error) {
  //     throw new RpcException({
  //       status: 400,
  //       message: error.message,
  //     });
  //   }
  // }
  
  //* **********************************************
  // async createOrder(createOrderDto: CreateOrderDto) {
  //   const { user_id } = createOrderDto;
  //   try {
  //     // 🔹 Obtener carrito del usuario
  //     const cartResponse = await firstValueFrom(this.client.send('cart.items.get', { user_id }));
  //     const cartItems = cartResponse.cart;
  
  //     if (!cartItems || cartItems.length === 0) {
  //       throw new RpcException({
  //         status: 400,
  //         message: 'The user has no products in the cart.',
  //       });
  //     }
  
  //     // 🔹 Definir costos de envío
  //     const shipping_method = cartResponse.shipping_method || 'STANDARD';
  //     const shipping_cost = { STANDARD: 3.99, EXPRESS: 7.99, STORE: 0.0 }[shipping_method];
  
  //     // 🔹 Calcular totales
  //     const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0);
  //     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  //     const finalAmount = totalAmount + shipping_cost;
  
  //     // 🔹 Crear orden sin incluir `order_items`
  //     const order = await this.$transaction(async (prisma) => {
  //       const newOrder = await prisma.order.create({
  //         data: { user_id, total_amount: finalAmount, total_items: totalItems, status: "PENDING", paid: false },
  //       });
  
  //       await prisma.order_item.createMany({
  //         data: cartItems.map((item) => ({
  //           order_id: newOrder.order_id,
  //           product_id: item.product_id,
  //           quantity: item.quantity,
  //           price: parseFloat(item.price),
  //           product_name: item.product_name,
  //           image_url: item.image_url,
  //         })),
  //       });
  
  //       return newOrder;
  //     });
  
  //     const { order_id } = order;
  
  //     // 🔹 Emitir evento sin bloquear el proceso
  //     this.client.emit('order.created', { order_id, user_id, total_amount: finalAmount, totalItems });
  
  //     // ✅ Solo devolver el `order_id` (No `order_items`)
  //     return { order_id, user_id, total_amount: finalAmount, totalItems, status: "PENDING", paid: false };
  //   } catch (error) {
  //     throw new RpcException({ status: 400, message: error.message });
  //   }
  // }
  
  async createOrder(createOrderDto: CreateOrderDto) {
    const { user_id } = createOrderDto;
    try {
      // 🔹 Obtener carrito del usuario
      const cartResponse = await firstValueFrom(this.client.send('cart.items.get', { user_id }));
      const cartItems = cartResponse.cart;
  
      if (!cartItems || cartItems.length === 0) {
        throw new RpcException({
          status: 400,
          message: 'The user has no products in the cart.',
        });
      }
  
      // 🔹 Definir costos de envío
      const shipping_method = cartResponse.shipping_method || 'STANDARD';
      const shipping_cost = { STANDARD: 3.99, EXPRESS: 7.99, STORE: 0.0 }[shipping_method];
  
      // 🔹 Calcular totales
      const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0);
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const finalAmount = totalAmount + shipping_cost;
  
      // 🔹 Crear la orden en la base de datos
      const order = await this.$transaction(async (prisma) => {
        const newOrder = await prisma.order.create({
          data: { 
            user_id, 
            total_amount: finalAmount, 
            total_items: totalItems, 
            status: "PENDING", 
            paid: false 
          },
        });
  
        await prisma.order_item.createMany({
          data: cartItems.map((item) => ({
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            product_name: item.product_name,
            image_url: item.image_url,
          })),
        });
  
        return newOrder;
      });
  
      const { order_id } = order;
  
      // 🔹 Crear estructura de reservas
      const reservations = cartItems.map((item) => ({
        product_id: item.product_id,
        order_id,
        quantity: item.quantity,
        user_id,
      }));
  
      // 🔹 Ejecutar `create_reservations` y `order.created` en paralelo para que no bloqueen la respuesta
      await Promise.all([
        firstValueFrom(this.client.send('create_reservations', { reservations })), // 🔹 Crear reservas
        this.client.emit('order.created', { order_id, user_id, total_amount: finalAmount, totalItems }) // 🔹 Emitir evento
      ]);
  
      // ✅ Solo devolver el `order_id`, el cliente puede hacer `GET /orders/:order_id` si necesita más detalles.
      return { order_id, user_id, total_amount: finalAmount, totalItems, status: "PENDING", paid: false };
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message });
    }
  }
  
  
  // async findOrderById(order_id: string, includeOrderItems = true) {
  //   const order = await this.order.findUnique({
  //     where: { order_id },
  //     include: includeOrderItems ? { order_items: true } : undefined,
  //   });

  //   if (!order) {
  //     throw new RpcException({
  //       status: 404,
  //       message: `Order with ID ${order_id} not found.`,
  //     });
  //   }

  //   const cartResponse = await firstValueFrom(
  //     this.client.send('cart.items.get', { user_id: order.user_id }),
  //   );
  //   const { subtotal, shipping_cost, total } = cartResponse;

  //   return {
  //     ...order,
  //     subtotal,
  //     shipping_cost,
  //     total,
  //   };
  // }

  async findOrderById(order_id: string, includeOrderItems = true) {
    // 🔹 Obtener la orden con o sin `order_items`
    const order = await this.order.findUnique({
      where: { order_id },
      include: includeOrderItems ? { order_items: true } : undefined,
    });
  
    if (!order) {
      throw new RpcException({
        status: 404,
        message: `Order with ID ${order_id} not found.`,
      });
    }
  
    // 🔹 Si no se necesitan `order_items`, devolver la orden tal cual
    if (!includeOrderItems) {
      return order;
    }
  
    // 🔹 Obtener costos dinámicos del carrito (Si se necesitan más detalles)
    const cartResponse = await firstValueFrom(this.client.send('cart.items.get', { user_id: order.user_id }));
    const { subtotal, shipping_cost, total } = cartResponse;
  
    return {
      ...order,
      subtotal,
      shipping_cost,
      total,
    };
  }
  

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.client.send('payment.session.create', {
        order_id: order.order_id,
        currency: 'usd',
        items: order.OrderItem.map((item) => ({
          ...item,
        })),
      }),
    );
    return paymentSession;
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
    // this.logger.log(paidOrderDto);

    const order = await this.order.findUnique({
      where: { order_id: paidOrderDto.order_id },
      include: { order_items: true },
    });

    if (!order) {
      throw new RpcException({
        status: 404,
        message: `Order with ID ${paidOrderDto.order_id} not found.`,
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
        message:
          'One or more reservations have expired. Payment cannot be processed.',
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
      EXPIRED: 'Cannot cancel an expired order.',
      PAID: 'Cannot cancel an already paid order.',
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

      return { message: 'Order successfully cancelled.' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error cancelling order: ${error.message}`,
      });
    }
  }

  async handleOrderExpired(order_id: string) {
    try {
      const order = await this.findOrderById(order_id, false);

      if (order.status === 'PAID') {
        throw new RpcException({
          status: 400,
          message: 'Cannot mark a paid order as expired.',
        });
      }

      await this.order.update({
        where: { order_id },
        data: { status: 'EXPIRED' },
      });
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error marking order as expired: ${error.message}`,
      });
    }
  }
}
