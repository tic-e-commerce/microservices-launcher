import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
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
}
