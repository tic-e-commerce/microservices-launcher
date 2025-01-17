import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { AddFavoriteProductDto } from './dto/add-favorite-product.dto';
import { stat } from 'fs';

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

      const favoriteProduct = await this.favoriteProduct.findFirst({
        where: {
          user_id,
          product_id,
        },
      });

      if (favoriteProduct) {
        return favoriteProduct;
      }

      const newFavoriteProduct = await this.favoriteProduct.create({
        data: {
          user_id,
          product_id,
        },
      });

      return newFavoriteProduct;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async getFavoriteProducts(user_id: number) {
    try {
      let products = [];
      await this.validateUser(user_id);
      const favoriteProducts = await this.favoriteProduct.findMany({
        where: {
          user_id,
        },
      });

      for (const favoriteProduct of favoriteProducts) {
        const product = await this.validateProduct(favoriteProduct.product_id);
        product.favorite_product_id = favoriteProduct.favorite_product_id;
        products.push(product);
      }

      return {
        status: 200,
        user_id,
        products,
      };
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

  async deleteFavoriteProduct(favorite_product_id: number) {
    try {
      const favoriteProduct = await this.favoriteProduct.findUnique({
        where: {
          favorite_product_id: favorite_product_id,
        },
      });

      if (!favoriteProduct) {
        throw new RpcException({
          status: 404,
          message: 'Favorite product not found',
        });
      }

      await this.favoriteProduct.delete({
        where: {
          favorite_product_id: favorite_product_id,
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
