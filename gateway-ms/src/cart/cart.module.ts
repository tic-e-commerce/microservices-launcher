import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CartController],
  imports: [NatsModule],
})
export class CartModule {}
