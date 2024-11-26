import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ReviewController],
  imports: [NatsModule],
})
export class ReviewModule {}
