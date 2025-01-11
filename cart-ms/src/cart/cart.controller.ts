import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import {
  CartClearEventDto,
  CartItemActionDto,
  CreateCartDto,
  UpdateCartDto,
} from './common';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('createCart')
  async create(@Payload() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @MessagePattern('findAllCart')
  async findAll(@Payload('user_id') user_id: number) {
    return this.cartService.findAll(user_id);
  }

  @MessagePattern('updateCart')
  async update(@Payload() updateCartDto: UpdateCartDto) {
    return this.cartService.update(updateCartDto);
  }

  @MessagePattern('removeCart')
  async remove(@Payload() cartItemActionDto: CartItemActionDto) {
    return this.cartService.remove(cartItemActionDto);
  }

  @EventPattern('order.processed')
  async handleOrderProcessed(@Payload() cartClearEventDto: CartClearEventDto) {
    return this.cartService.clearCart(cartClearEventDto.user_id);
  }
}
