import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [CartController],
  imports: [
    NatsModule,
  ]
})
export class CartModule {}



// import { Module } from '@nestjs/common';
// import { CartController } from './cart.controller';
// import { NatsModule } from 'src/transports/nats.module';

// @Module({
//   controllers: [CartController],
//   imports: [
//     // ClientsModule.register([
//     //   { 
//     //     name: CART_SERVICE, 
//     //     transport: Transport.TCP, 
//     //     options: {
//     //       // host: envs.cartMicroserviceHost,
//     //       // port: envs.cartMicroservicePort
//     //     }
//     //   },
//     // ]),
//     NatsModule,
//   ]
// })
// export class CartModule {}
