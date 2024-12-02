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
}
