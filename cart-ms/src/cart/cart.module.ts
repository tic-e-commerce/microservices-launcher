import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
    // ClientsModule.register([
    //   {
    //     name: PRODUCT_SERVICE,
    //     transport: Transport.TCP,
    //     options: {
    //       // host: envs.productsMicroserviceHost,
    //       // port: envs.productsMicroservicePort,
    //     },
    //   },
    // ]),
    NatsModule
  ],
})
export class CartModule {}