import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ImageController],
  providers: [ImageService],
  imports: [NatsModule],
})
export class ImageModule {}
