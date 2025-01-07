import { Controller } from '@nestjs/common';
import { FavoriteProductService } from './favorite-product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { number } from 'joi';
import { AddFavoriteProductDto } from './dto/add-favorite-product.dto';

@Controller()
export class FavoriteProductController {
  constructor(
    private readonly favoriteProductService: FavoriteProductService,
  ) {}

  @MessagePattern('favorite_product.add')
  async addFavoriteProduct(
    @Payload() addFavoriteProductDto: AddFavoriteProductDto,
  ) {
    return this.favoriteProductService.addFavoriteProduct(
      addFavoriteProductDto,
    );
  }

  @MessagePattern('favorite_product.get')
  async getFavoriteProducts(@Payload() user_id: number) {
    return this.favoriteProductService.getFavoriteProducts(user_id);
  }

  @MessagePattern('favorite_product.delete')
  async deleteFavoriteProduct(@Payload() favorite_product_id: number) {
    return this.favoriteProductService.deleteFavoriteProduct(
      favorite_product_id,
    );
  }
}
