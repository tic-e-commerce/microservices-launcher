import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [AttributesController],
  providers: [AttributesService],
  imports: [NatsModule],
})
export class AttributesModule {}
