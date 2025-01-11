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
    const quantities = { [productId]: quantity };

    try {
      await firstValueFrom(
        this.client.send('validate_products', { ids: [productId], quantities }),
      );
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: 'Producto no disponible en la cantidad solicitada.',
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
            this.logger.warn(
              `No se pudo obtener información del producto ${item.product_id}: ${error.message}`,
            );
            return null;
          }
        }),
      );

      const result = cartItems.map((item) => {
        const productDetail = productDetails.find(
          (product) => product?.product_id === item.product_id,
        );

        return {
          ...item,
          product_name: productDetail?.product_name || 'Producto desconocido',
          price: productDetail?.price || 0,
          image_url: productDetail?.image_url || null,
          total_price: item.quantity * (productDetail?.price || 0),
        };
      });

      return result;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error al obtener el carrito: ${error.message}`,
      });
    }
  }

  async update(updateCartDto: UpdateCartDto) {
    const { product_id, user_id, quantity } = updateCartDto;

    if (quantity <= 0) {
      throw new RpcException({
        status: 400,
        message: 'La cantidad debe ser mayor a cero.',
      });
    }

    await this.verifyProductAvailability(product_id, quantity);
    const existingCartItem = await this.cartItem.findFirst({
      where: { user_id, product_id },
    });

    if (!existingCartItem) {
      throw new RpcException({
        status: 400,
        message: 'Producto no encontrado en el carrito.',
      });
    }

    const updatedCartItem = await this.cartItem.update({
      where: { cart_item_id: existingCartItem.cart_item_id },
      data: { quantity },
    });

    return updatedCartItem;
  }

  async remove(cartItemActionDto: CartItemActionDto) {
    const { user_id, product_id } = cartItemActionDto;

    const cartItem = await this.cartItem.findFirst({
      where: { user_id, product_id },
      select: { cart_item_id: true },
    });

    if (!cartItem) {
      throw new RpcException({
        status: 400,
        message: 'Producto no encontrado en el carrito.',
      });
    }

    await this.cartItem.delete({
      where: { cart_item_id: cartItem.cart_item_id },
    });

    return { message: 'Producto eliminado del carrito.' };
  }

  async clearCart(user_id: number) {
    try {
      await this.cartItem.deleteMany({ where: { user_id } });
      return { message: 'Carrito eliminado con éxito.' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `Error al limpiar el carrito: ${error.message}`,
      });
    }
  }
}