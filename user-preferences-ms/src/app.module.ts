import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { FavoriteProductModule } from './favorite-product/favorite-product.module';

@Module({
  imports: [UserPreferencesModule, FavoriteProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
