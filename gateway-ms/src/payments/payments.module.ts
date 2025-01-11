import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PaymentsController],
  imports: [NatsModule]
})
export class PaymentsModule {}
