import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Post('create-payment-session')
  async createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('create.payment.session', paymentSessionDto),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const rawBody = req['rawBody'];
      const headers = req.headers;

      const response = await firstValueFrom(
        this.client.send('process.payment.webhook', {
          rawBody,
          headers,
        }),
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to process webhook',
        details: error.message,
      });
    }
  }

  @Get('success')
  success(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      ok: true,
      message: 'Payment successful',
    });
  }

  @Get('cancel')
  cancel(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      ok: false,
      message: 'Payment cancelled',
    });
  }

  @Get('health')
  async checkHealth() {
    console.log('Checking health of payments service');
    return await firstValueFrom(this.client.send('payments.health', {}));
  }
}
