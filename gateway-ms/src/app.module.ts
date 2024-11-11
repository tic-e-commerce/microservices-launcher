import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [NatsModule, AuthModule, HealthCheckModule, CartModule],
})
export class AppModule {}
