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
import { ClientProxy } from '@nestjs/microservices';
import { FindCartDto } from 'src/common';

@Controller('cart')
export class CartController {
  private readonly logger = new Logger('CartController');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    this.logger.log('Creando un nuevo producto en el carrito');
    return this.client.send('createCart', createCartDto);
  }

  @Get(':userId')
  // findAll(@Param('userId') userId: number) {
  //   findAll(@Param('userId') userId: string) {
  //   this.logger.log(`Obteniendo todos los productos en el carrito del usuario con ID: ${userId}`);
  //   return this.client.send('findAllCart', {userId});
  // }
  findAll(@Param() findCartDto: FindCartDto) {
    const { userId } = findCartDto;
    this.logger.log(
      `Obteniendo todos los productos en el carrito del usuario con ID: ${userId}`,
    );
    return this.client.send('findAllCart', userId);
  }

  // @Post(':id')
  // update(
  //   @Param('id') id: number,
  //   @Body() updateCartDto: UpdateCartDto,
  // ) {
  //   this.logger.log(`Actualizando el producto en el carrito con ID: ${id}`);
  //   return this.client.send('updateCart', { ...updateCartDto, id });
  // }
  @Patch(':userId/:productId')
  updateQuantity(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateCartDto: UpdateCartDto, // donde solo actualizas la cantidad
  ) {
    this.logger.log(
      `Actualizando la cantidad del producto con ID: ${productId} en el carrito del usuario con ID: ${userId}`,
    );
    return this.client.send('updateCart', {
      userId,
      productId,
      quantity: updateCartDto.quantity,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    this.logger.log(`Eliminando producto con ID: ${id} del carrito`);
    return this.client.send('removeCart', id);
  }
  // @Delete(':userId/:productId')
  // remove(
  //   @Param('userId') userId: number,
  //   @Param('productId') productId: number,
  // ) {
  //   this.logger.log(
  //     `Eliminando producto con ID: ${productId} del carrito del usuario con ID: ${userId}`,
  //   );
  //   return this.client.send('removeCart', { userId, productId });
  // }

  @Get(':userId/total')
  calculateTotal(@Param('userId') userId: number) {
    this.logger.log(
      `Calculando el total del carrito del usuario con ID: ${userId}`,
    );
    return this.client.send('calculateTotalCart', userId);
  }

  @Delete(':userId/clear')
  clearCart(@Param('userId') userId: number) {
    this.logger.log(`Vaciando el carrito del usuario con ID: ${userId}`);
    return this.client.send('clearCart', userId);
  }
}

// import { Controller, Get, Post, Body, Param, Delete, Inject } from '@nestjs/common';
// import { CreateCartDto } from './dto/create-cart.dto';
// import { NATS_SERVICE } from 'src/config';
// import { ClientProxy } from '@nestjs/microservices';

// @Controller('cart')
// export class CartController {
//   constructor(
//     @Inject(NATS_SERVICE) private readonly client: ClientProxy,
//   ) {}

//   @Post()
//   create(@Body() createCartDto: CreateCartDto) {
//     return this.client.send('createCart', createCartDto);
//   }

//   @Get()
//   findAll() {
//     return this.client.send('findAllCart', {});
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.client.send('findOneCart', {id});
//   }

//   // @Patch(':id')
//   // update(
//   //   @Param('id') id: string,
//   //   @Body() updateCartDto: UpdateCartDto) {
//   //   return this.cartService.update(+id, updateCartDto);
//   // }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.client.send('removeCart', {id});
//   }
// }
