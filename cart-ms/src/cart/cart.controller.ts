import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { CreateCartDto } from './common/dto/create-cart.dto';
import { UpdateCartDto } from './common/dto/update-cart.dto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // 1. Agregar producto al carrito
  @MessagePattern('createCart')
  create(@Payload() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  // 2. Obtener todos los productos del carrito para un usuario
  @MessagePattern('findAllCart')
  async findAll(@Payload('userId') userId: number) {
    return this.cartService.findAll(userId);
  }

  // @MessagePattern('findOneCart')
  // findOne(@Payload('id') id: number) {
  //   return this.cartService.findOne(id);
  // }

  // 3. Actualizar la cantidad de un producto en el carrito

  // @MessagePattern('updateCart')
  // update(@Payload() updateCartDto: UpdateCartDto) {
  //   return this.cartService.update(updateCartDto.id, updateCartDto);
  // }

  @MessagePattern('updateCart')
  updateQuantity(
    @Payload()
    {
      userId,
      productId,
      quantity,
    }: {
      userId: number;
      productId: number;
      quantity: number;
    },
  ) {
    return this.cartService.update(userId, productId, quantity);
  }

  //4. Eliminar un producto del carrito
  @MessagePattern('removeCart')
  remove(@Payload() id: number) {
    return this.cartService.remove(id);
  }

  // // 4. Eliminar un producto del carrito
  // @MessagePattern('removeCart')
  // remove(
  //   @Payload() { userId, productId }: { userId: number; productId: number },
  // ) {
  //   return this.cartService.remove(userId, productId);
  // }

  // 5. Calcular el total del carrito
  @MessagePattern('calculateTotalCart')
  async calculateTotal(@Payload() userId: number) {
    return this.cartService.calculateTotal(userId);
  }

  // 6. Vaciar el carrito
  @MessagePattern('clearCart')
  async clearCart(@Payload() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
