import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [NatsModule, AuthModule, HealthCheckModule, ProductsModule, CartModule, ProfileModule],
})
export class AppModule {}
