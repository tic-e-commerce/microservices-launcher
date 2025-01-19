import { Controller, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CartController.name);
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

  @MessagePattern('shippingCart')
  async updateShippingMethod(@Payload() payload: { user_id: number; shipping_method: 'STANDARD' | 'EXPRESS' | 'STORE' }) {
    const { user_id, shipping_method } = payload;

    this.logger.log(`Updating shipping method for user ${user_id} to ${shipping_method}`);
    return await this.cartService.updateShippingMethod(user_id, shipping_method);
  }
}
