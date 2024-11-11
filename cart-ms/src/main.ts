import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('CartMS-Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, 
    // {
    //   transport: Transport.TCP,
    //   options: {
    //     port: envs.port 
    //   }
    // }
    {
      transport: Transport.NATS,
      options: {
        // port: envs.port 
        servers: envs.natsServers
      }
    }
  );



  await app.listen();

  logger.log(`Microservice running on port ${envs.port}`);

}
bootstrap();
