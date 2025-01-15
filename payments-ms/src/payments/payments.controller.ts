import { Controller, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('create.payment.session')
  async createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    return await this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @MessagePattern('process.payment.webhook')
  async processWebhook(
    @Payload() data: { rawBody: string; headers: Record<string, string> },
  ) {
    try {
      await this.paymentsService.processWebhook(data.rawBody, data.headers);
      return { status: 'success' };
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern('payments.health')
  checkHealth() {
    return { status: 'ok Gaby' };
  }
}