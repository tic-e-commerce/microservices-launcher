import { Module } from '@nestjs/common';
import { AttributesController } from './attributes.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [AttributesController],
  imports: [NatsModule],
})
export class AttributesModule {}
