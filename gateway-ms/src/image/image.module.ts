import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ImageController],
  imports: [NatsModule],
})
export class ImageModule {}
