import { Module } from '@nestjs/common';
import { FavoriteProductService } from './favorite-product.service';
import { FavoriteProductController } from './favorite-product.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [FavoriteProductController],
  providers: [FavoriteProductService],
  imports: [NatsModule],
})
export class FavoriteProductModule {}
