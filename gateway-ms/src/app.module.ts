import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { ProfileModule } from './profile/profile.module';
import { ReviewModule } from './review/review.module';
import { AttributesModule } from './attributes/attributes.module';
import { ImageModule } from './image/image.module';
import { OrdersModule } from './orders/orders.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    NatsModule,
    AuthModule,
    HealthCheckModule,
    ProductsModule,
    CartModule,
    ProfileModule,
    ReviewModule,
    AttributesModule,
    ImageModule,
    OrdersModule,
    UserPreferencesModule,
    PaymentsModule
  ],
})
export class AppModule {}
