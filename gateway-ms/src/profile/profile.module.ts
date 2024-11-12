import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ProfileController],
  imports: [NatsModule],
})
export class ProfileModule {}
