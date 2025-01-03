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
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('cart')
export class CartController {
  private readonly logger = new Logger('CartController');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  async create(@Body() createCartDto: CreateCartDto) {
    this.logger.log('Creando un nuevo producto en el carrito');
    try {
      const response = await firstValueFrom(
        this.client.send('createCart', createCartDto),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error al crear un producto en el carrito',
        error.message,
      );
      throw new RpcException(error);
    }
  }
  
  @Get(':user_id')
  async findAll(@Param('user_id', ParseIntPipe) user_id: number) {
    this.logger.log(
      `Obteniendo todos los productos en el carrito del usuario con ID: ${user_id}`,
    );
    try {
      const response = await firstValueFrom(
        this.client.send('findAllCart', { user_id }),
      );
      return response;
    } catch (error) {
      this.logger.error('Error al obtener el carrito', error.message);
      throw new RpcException(error);
    }
  }

  @Patch(':user_id/:product_id')
  async updateQuantity(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Param('product_id', ParseIntPipe) product_id: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    this.logger.log(
      `Actualizando la cantidad del producto con ID: ${product_id} en el carrito del usuario con ID: ${user_id}`,
    );

    try {
      const updatePayload = { ...updateCartDto, user_id, product_id };
      const response = await firstValueFrom(
        this.client.send('updateCart', updatePayload),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error al actualizar la cantidad del producto',
        error.message,
      );
      throw new RpcException(error);
    }
  }

  @Delete(':user_id/:product_id')
  async remove(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Param('product_id', ParseIntPipe) product_id: number,
  ) {
    this.logger.log(
      `Eliminando producto con ID: ${product_id} del carrito del usuario con ID: ${user_id}`,
    );
    try {
      const response = await firstValueFrom(
        this.client.send('removeCart', { user_id, product_id }),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error al eliminar el producto del carrito',
        error.message,
      );
      throw new RpcException(error);
    }
  }

  @Get(':user_id/total')
  async calculateTotal(@Param('user_id') user_id: number) {
    this.logger.log(
      `Calculando el total del carrito del usuario con ID: ${user_id}`,
    );
    try {
      const response = await firstValueFrom(
        this.client.send('calculateTotalCart', { user_id }),
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error al calcular el total del carrito',
        error.message,
      );
      throw new RpcException(error);
    }
  }

  @Delete(':user_id/clear')
  async clearCart(@Param('user_id', ParseIntPipe) user_id: number) {
    this.logger.log(`Vaciando el carrito del usuario con ID: ${user_id}`);
    try {
      const response = await firstValueFrom(
        this.client.send('clearCart', { user_id }),
      );
      return response;
    } catch (error) {
      this.logger.error('Error al vaciar el carrito', error.message);
      throw new RpcException(error);
    }
  }
}