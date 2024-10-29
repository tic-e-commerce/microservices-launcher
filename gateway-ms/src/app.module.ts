import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [NatsModule, AuthModule, HealthCheckModule],
})
export class AppModule {}
