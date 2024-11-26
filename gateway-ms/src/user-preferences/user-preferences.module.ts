import { Module } from '@nestjs/common';
import { UserPreferencesController } from './user-preferences.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [UserPreferencesController],
})
export class UserPreferencesModule {}
