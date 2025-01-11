import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { RpcCustomExceptionFilter } from './common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: '',
        method: RequestMethod.GET,
      },
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(
    '/api/payments/webhook',
    bodyParser.raw({
      type: 'application/json',
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter());
  await app.listen(envs.PORT);

  // console.log('Health check configured');
  logger.log(`Gateway is running on: ${envs.PORT}`);
}
bootstrap();
