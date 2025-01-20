import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import {
  CartClearEventDto,
  CartItemActionDto,
  CreateCartDto,
  ShippingMethod,
  UpdateCartDto,
} from './common';


@Controller()
export class CartController {
  private readonly logger = new Logger(CartController.name);
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('cart.item.add')
  async create(@Payload() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @MessagePattern('cart.items.get')
  async findAll(@Payload('user_id') user_id: number) {
    return this.cartService.findAll(user_id);
  }

  @MessagePattern('cart.item.update')
  async update(@Payload() updateCartDto: UpdateCartDto) {
    return this.cartService.update(updateCartDto);
  }

  @MessagePattern('cart.item.remove')
  async remove(@Payload() cartItemActionDto: CartItemActionDto) {
    return this.cartService.remove(cartItemActionDto);
  }

  @EventPattern('order.processed')
  async handleOrderProcessed(@Payload() cartClearEventDto: CartClearEventDto) {
    return this.cartService.clearCart(cartClearEventDto.user_id);
  }

  @MessagePattern('cart.shippingMethod.set')
  async updateShippingMethod(@Payload() payload: { user_id: number; shipping_method: ShippingMethod },
  ) {
    const { user_id, shipping_method } = payload;
    return await this.cartService.updateShippingMethod(
      user_id,
      shipping_method,
    );
  }
}