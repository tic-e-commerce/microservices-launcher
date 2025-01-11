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
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('cart')
export class CartController {
  private readonly logger = new Logger('CartController');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createCartDto: CreateCartDto) {
    return this.client.send('createCart', createCartDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    ); 
  }

  
  @UseGuards(AuthGuard)
  @Get(':user_id')
  async findAll(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.client.send('findAllCart', { user_id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':user_id/:product_id')
  async update(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Param('product_id', ParseIntPipe) product_id: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    try {
      const updatePayload = { ...updateCartDto, user_id, product_id };
      const response = await firstValueFrom(
        this.client.send('updateCart', updatePayload),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':user_id/:product_id')
  async remove(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Param('product_id', ParseIntPipe) product_id: number,
  ) {
    try {
      const response = await firstValueFrom(
        this.client.send('removeCart', { user_id, product_id }),
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}