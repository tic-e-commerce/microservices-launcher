import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Inject,
  Logger,
  Patch,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ShippingMethod } from './enums/shipping-method.enum';

@Controller('cart')
export class CartController {
  private readonly logger = new Logger('CartController');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Post('add-item')
  async create(@Body() createCartDto: CreateCartDto, @Req() req) {
    const user = req.user;
    createCartDto.user_id = user.user_id;
    return this.client.send('cart.item.add', createCartDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get('items')
  async findAll(@Req() req) {
    const user = req.user;
    return this.client.send('cart.items.get', { user_id: user.user_id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Patch('update-item/:product_id')
  async update(
    @Param('product_id', ParseIntPipe) product_id: number,
    @Body() updateCartDto: UpdateCartDto,
    @Req() req,
  ) {
    const user = req.user;
    const updatePayload = {
      ...updateCartDto,
      user_id: user.user_id,
      product_id,
    };
    try {
      const response = await firstValueFrom(
        this.client.send('cart.item.update', updatePayload),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('remove-item/:product_id')
  async remove(@Param('product_id', ParseIntPipe) product_id: number, @Req() req) {
    const user = req.user;
    try {
      const response = await firstValueFrom(
        this.client.send('cart.item.remove', {
          user_id: user.user_id,
          product_id,
        }),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('set-shipping-method')
  async setShippingMethod(
    @Body() payload: { shipping_method: ShippingMethod },
    @Req() req,
  ) {
    const user = req.user;
    const requestPayload = { ...payload, user_id: user.user_id };
    return this.client.send('cart.shippingMethod.set', requestPayload).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}