import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { CreateCartDto } from './common/dto/create-cart.dto';
import { UpdateCartDto } from './common/dto/update-cart.dto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Agregar un producto al carrito 
  @MessagePattern('createCart')
  create(@Payload() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  // Obtener el carrito completo de un usuario
  @MessagePattern('findAllCart')
  async findAll(@Payload('user_id') user_id: number) {
    return this.cartService.findAll(user_id);
  }

  // Actualizar la cantidad de un producto en el carrito
  @MessagePattern('updateCart')
  async updateQuantity(@Payload() updateCartDto: UpdateCartDto) {
    return this.cartService.update(updateCartDto);
  }
  
  // Eliminar un producto del carrito
  @MessagePattern('removeCart')
  remove(@Payload() { user_id, product_id }: { user_id: number; product_id: number }) {
    return this.cartService.remove(user_id, product_id);
  }
  
  // Calcular el total del carrito
  @MessagePattern('calculateTotalCart')
  async calculateTotal(@Payload('user_id') user_id: number) {
    return this.cartService.calculateTotal(user_id);
  }

  // Vaciar el carrito completo de un usuario
  @MessagePattern('clearCart')
  async clearCart(@Payload('user_id') user_id: number) {
    return this.cartService.clearCart(user_id);
  }
}