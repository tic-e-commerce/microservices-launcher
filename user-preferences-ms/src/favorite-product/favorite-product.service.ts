import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { AddFavoriteProductDto } from './dto/add-favorite-product.dto';

@Injectable()
export class FavoriteProductService
  extends PrismaClient
  implements OnModuleInit
{
  private readonly logger = new Logger('FavoriteProductService');

  constructor(
    @Inject(NATS_SERVICE) private readonly serviceClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async addFavoriteProduct(addFavoriteProductDto: AddFavoriteProductDto) {
    try {
      const { user_id, product_id } = addFavoriteProductDto;

      await this.validateUser(user_id);
      await this.validateProduct(product_id);

      const favoriteProduct = await this.favoriteProduct.create({
        data: {
          user_id,
          product_id,
        },
      });

      return favoriteProduct;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async validateProduct(product_id: number) {
    const product = await firstValueFrom(
      this.serviceClient.send('find_one_product', product_id),
    );
    if (!product) {
      throw new RpcException({
        status: 404,
        message: 'Product not found',
      });
    }

    return product;
  }

  async validateUser(user_id: number) {
    const user = await firstValueFrom(
      this.serviceClient.send('profile.get', { user_id }),
    );
    if (!user) {
      throw new RpcException({
        status: 404,
        message: 'User not found',
      });
    }

    return user;
  }
}
