import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config';
import { NATS_SERVICE } from 'src/config/services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          //host: envs.productMicroserviceHost,
          //port: envs.productMicroservicePort
          servers: envs.natsServers,
        },
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          //host: envs.productMicroserviceHost,
          //port: envs.productMicroservicePort
          servers: envs.natsServers,
        },
      },
    ]),
  ],
})
export class NatsModule {}
