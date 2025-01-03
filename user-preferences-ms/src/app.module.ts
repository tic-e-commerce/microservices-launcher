import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FavoriteProductModule } from './favorite-product/favorite-product.module';

@Module({
  imports: [FavoriteProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
