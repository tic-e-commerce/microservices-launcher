import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [NatsModule, AuthModule, HealthCheckModule, ProductsModule, CartModule, ReviewModule],
})
export class AppModule {}
