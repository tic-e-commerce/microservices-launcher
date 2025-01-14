import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { CreateCartDto } from './common/dto/create-cart.dto';
import { UpdateCartDto } from './common/dto/update-cart.dto';
import { firstValueFrom } from 'rxjs';
import { CartItemActionDto } from './common';

@Injectable()
export class CartService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CartService.name);
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  private async verifyProductAvailability(productId: number, quantity: number) {
    const payload = { items: [{ product_id: productId, quantity }] };
    try {
      await firstValueFrom(this.client.send('validate_products', payload));
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async create(createCartDto: CreateCartDto) {
    const { product_id, quantity, user_id } = createCartDto;
    await this.verifyProductAvailability(product_id, quantity);

    const existingCartItem = await this.cartItem.findFirst({
      where: { user_id, product_id },
    });

    const cartItem = existingCartItem
      ? await this.cartItem.update({
          where: { cart_item_id: existingCartItem.cart_item_id },
          data: { quantity: existingCartItem.quantity + quantity },
        })
      : await this.cartItem.create({
          data: { user_id, product_id, quantity },
        });

    return cartItem;
  }

  async findAll(user_id: number) {
    try {
      const cartItems = await this.cartItem.findMany({ where: { user_id } });

      const productDetails = await Promise.all(
        cartItems.map(async (item) => {
          try {
            return await firstValueFrom(
              this.client.send('find_one_product', item.product_id),
            );
          } catch (error) {
            throw new RpcException({
              status: 400,
              message: error.message,
            });
          }
        }),
      );

      const result = cartItems.map((item) => {
        const productDetail = productDetails.find(
          (product) => product?.product_id === item.product_id,
        );

        return {
          ...item,
          product_name: productDetail?.product_name || 'Unknown product',
          price: productDetail?.price || 0,
          image_url: productDetail?.image_url || null,
          total_price: item.quantity * (productDetail?.price || 0),
        };
      });

      const subtotal = result.reduce((sum, item) => sum + item.total_price, 0);

      return {
        cart: result,
        subtotal: subtotal,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async update(updateCartDto: UpdateCartDto) {
    const { product_id, user_id, quantity } = updateCartDto;
    await this.verifyProductAvailability(product_id, quantity);
    const cartItem = await this.findCartItem(user_id, product_id);
    const updatedCartItem = await this.cartItem.update({
      where: { cart_item_id: cartItem.cart_item_id },
      data: { quantity },
    });

    return updatedCartItem;
  }

  async remove(cartItemActionDto: CartItemActionDto) {
    const { user_id, product_id } = cartItemActionDto;
    const cartItem = await this.findCartItem(user_id, product_id);
    await this.cartItem.delete({
      where: { cart_item_id: cartItem.cart_item_id },
    });
    const updatedCart = await this.cartItem.findMany({
      where: { user_id },
      select: {
        product_id: true,
        quantity: true,
      },
    });
    return {
      message: 'Product removed from the cart.',
      updatedCart,
    };
  }

  async clearCart(user_id: number) {
    try {
      await this.cartItem.deleteMany({ where: { user_id } });
      return { message: 'Cart successfully cleared.' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error clearing the cart: ${error.message}`,
      });
    }
  }

  private async findCartItem(user_id: number, product_id: number) {
    const cartItem = await this.cartItem.findFirst({
      where: { user_id, product_id },
      select: { cart_item_id: true },
    });

    if (!cartItem) {
      throw new RpcException({
        status: 400,
        message: 'Product not found in the cart.',
      });
    }
    return cartItem;
  }
}