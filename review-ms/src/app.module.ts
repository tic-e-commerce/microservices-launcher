import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ReviewModule } from './review/review.module';
import { AppService } from './app.service';

@Module({
  imports: [ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
