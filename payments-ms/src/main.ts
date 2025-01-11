import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Payments-ms');
  const app = await NestFactory.create(AppModule);

  app.use(
    '/api/payments/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.error('Validation errors:', errors);
        return new BadRequestException('Validation failed');
      },
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers,
    },
  });

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`Payments Microservice is running on port ${envs.port}`);
}
bootstrap();