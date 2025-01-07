import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { AddFavoriteProductDto } from './dto/add-favorite-product.dto';
import { catchError } from 'rxjs';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Post('add-favorite-product')
  async addFavoriteProduct(
    @Body() addFavoriteProductDto: AddFavoriteProductDto,
  ) {
    return this.client.send('favorite_product.add', addFavoriteProductDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get('favorite-products/:user_id')
  async getFavoriteProducts(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.client.send('favorite_product.get', user_id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Delete('delete-favorite-product/:favorite_product_id')
  async deleteFavoriteProduct(
    @Param('favorite_product_id', ParseIntPipe) favorite_product_id: number,
  ) {
    return this.client
      .send('favorite_product.delete', favorite_product_id)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
