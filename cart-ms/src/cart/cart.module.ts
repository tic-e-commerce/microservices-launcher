import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [NatsModule],
})
export class CartModule {}
