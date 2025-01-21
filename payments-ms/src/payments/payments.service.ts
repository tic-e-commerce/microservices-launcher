import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { envs } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService extends PrismaClient implements OnModuleInit {
  private readonly stripe = new Stripe(envs.stripeSecret);
  private readonly logger = new Logger(PaymentsService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { order_id, currency, billing_details } = paymentSessionDto;

    try {
      const orderDetails = await firstValueFrom(
        this.client.send('order.details.get', { order_id }),
      );

      // Validar el estado de la orden
      const invalidStatuses = {
        PAID: 'Payment cannot be processed for an order that has already been paid.',
        EXPIRED: 'Payment cannot be processed for an expired order.',
        CANCELLED: 'Payment cannot be processed for a cancelled order.',
      };

      if (invalidStatuses[orderDetails.status]) {
        throw new RpcException({
          status: 400,
          message: invalidStatuses[orderDetails.status],
        });
      }

      const lineItems = orderDetails.order_items.map((item) => ({
        price_data: {
          currency,
          product_data: {
            name: item.product_name,
            images: [item.image_url],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      }));

      const shipping_cost = orderDetails.shipping_cost || 0.0;
      if (shipping_cost > 0) {
        lineItems.push({
          price_data: {
            currency,
            product_data: {
              name: 'Shipping Cost',
              description: 'This is a fixed fee for shipping your order.',
            },
            unit_amount: Math.round(shipping_cost * 100),
          },
          quantity: 1,
        });
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_intent_data: {
          metadata: { order_id, ...billing_details },
        },
        metadata: { order_id },
        line_items: lineItems,
        mode: 'payment',
        success_url: envs.stripeSuccessUrl,
        cancel_url: envs.stripeCancelUrl,
      });

      const billingDetailsRecord = await this.billingDetails.create({
        data: { ...billing_details },
      });

      await this.payment.create({
        data: {
          order_id,
          stripe_payment_id: session.id,
          amount: session.amount_total / 100,
          currency,
          status: 'PENDING',
          receipt_url: session.url,
          billing_details_id: billingDetailsRecord.id,
        },
      });

      return {
        amount: session.amount_total / 100,
        status: 'PENDING',
        url: session.url,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async processWebhook(rawBody: string, headers: Record<string, string>) {
    const sig = headers['stripe-signature'];
    const endpointSecret = envs.stripeEndpointSecret;

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        endpointSecret,
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const existingPayment = await this.payment.findUnique({
            where: { stripe_payment_id: session.id },
          });

          if (!existingPayment) {
            throw new RpcException({
              status: 404,
              message: `No payment record found for session ID: ${session.id}`,
            });
          }

          // Actualizar el estado del pago en la base de datos
          await this.payment.update({
            where: { stripe_payment_id: session.id },
            data: {
              status: 'SUCCEEDED',
              updated_at: new Date(),
            },
          });

          // Emitir evento de éxito
          const orderDetails = await firstValueFrom(
            this.client.send('order.details.get', {
              order_id: existingPayment.order_id,
            }),
          );

          this.client.emit('payment.succeeded', {
            order_id: existingPayment.order_id,
            stripe_payment_id: existingPayment.id,
            receipt_url:  existingPayment.receipt_url,
            amount: session.amount_total / 100,
            currency: session.currency,
          });
          break;
        }

        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return { status: 'processed' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}