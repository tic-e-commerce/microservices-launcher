import {
  Injectable,
  Logger,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { CreateCartDto } from './common/dto/create-cart.dto';
import { UpdateCartDto } from './common/dto/update-cart.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CartService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  private logError(context: string, error: Error) {
    this.logger.error(`${context}: ${error.message}`, error.stack);
  }

  private async fetchProductDetails(productId: number) {
    try {
      const product = await firstValueFrom(this.client.send('find_one_product', productId));
      if (!product) throw new RpcException(`Producto con ID ${productId} no encontrado.`);
      return {
        product_id: productId, 
        product_name: product.product_name,
        price: Math.round(product.price * 100) / 100,
        image_url: product.image_url,
      };
    } catch (error) {
      this.logError(`Error obteniendo detalles del producto ${productId}`, error);
      throw new RpcException(`Error obteniendo detalles del producto con ID ${productId}`);
    }
  }

  private calculateTotalPrice(items: { price: number; quantity: number }[]): number {
    return Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100;
  }

  async create(createCartDto: CreateCartDto) {
    try {
      const { product_id, quantity, user_id } = createCartDto;
      await this.verifyProductAvailability(product_id, quantity);

      const productDetails = await this.fetchProductDetails(product_id);
      const existingCartItem = await this.cartItem.findFirst({
        where: { user_id, product_id },
      });

      const cartItem = existingCartItem
        ? await this.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + quantity },
          })
        : await this.cartItem.create({
            data: { user_id, product_id, quantity },
          });

      return {
        ...cartItem,
        ...productDetails,
        total_cart_price: this.calculateTotalPrice([
          { price: productDetails.price, quantity: cartItem.quantity },
        ]),
      };
    } catch (error) {
      this.logError('Error creando producto en el carrito', error);
      throw new RpcException('Error creando producto en el carrito.');
    }
  }

  async findAll(user_id: number) {
    try {
      const cartItems = await this.cartItem.groupBy({
        by: ['product_id', 'user_id'],
        _sum: { quantity: true },
        where: { user_id },
      });

      const productDetails = await Promise.all(
        cartItems.map((item) => this.fetchProductDetails(item.product_id))
      );

      const consolidatedCart = cartItems.map((item) => {
        const productDetail = productDetails.find(
          (product) => product.product_id === item.product_id
        );
        return {
          product_id: item.product_id,
          user_id: item.user_id,
          quantity: item._sum.quantity,
          ...productDetail,
          total_cart_price: this.calculateTotalPrice([
            { price: productDetail?.price || 0, quantity: item._sum.quantity },
          ]),
        };
      });

      return { cart: consolidatedCart };
    } catch (error) {
      this.logError('Error obteniendo el carrito consolidado', error);
      throw new RpcException('Error obteniendo el carrito consolidado.');
    }
  }

  async update(updateCartDto: UpdateCartDto) {
    try {
      const { user_id, product_id, quantity } = updateCartDto;
      const existingCartItem = await this.cartItem.findFirst({
        where: { user_id, product_id },
      });
      if (!existingCartItem) throw new RpcException('Producto no encontrado en el carrito.');

      return await this.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity },
      });
    } catch (error) {
      this.logError('Error actualizando producto en el carrito', error);
      throw new RpcException('Error actualizando producto en el carrito.');
    }
  }

  async remove(user_id: number, product_id: number) {
    try {
      const cartItem = await this.cartItem.findFirst({
        where: { user_id, product_id },
      });
      if (!cartItem) throw new RpcException('Producto no encontrado en el carrito.');

      await this.cartItem.delete({ where: { id: cartItem.id } });
      return { message: 'Producto eliminado del carrito.' };
    } catch (error) {
      this.logError('Error eliminando producto del carrito', error);
      throw new RpcException('Error eliminando producto del carrito.');
    }
  }

  async calculateTotal(user_id: number): Promise<number> {
    try {
      const cartItems = await this.cartItem.findMany({ where: { user_id } });
      const productDetails = await Promise.all(
        cartItems.map((item) => this.fetchProductDetails(item.product_id))
      );

      const total = this.calculateTotalPrice(
        cartItems.map((item, index) => ({
          price: productDetails[index]?.price || 0,
          quantity: item.quantity,
        }))
      );

      return total;
    } catch (error) {
      this.logError(`Error calculando el total del carrito del usuario ${user_id}`, error);
      throw new RpcException('Error calculando el total del carrito.');
    }
  }

  async clearCart(user_id: number) {
    try {
      const deletedItems = await this.cartItem.deleteMany({ where: { user_id } });
      this.logger.log(`Carrito vaciado para el usuario con ID: ${user_id}`);
      return deletedItems;
    } catch (error) {
      this.logError(`Error vaciando el carrito del usuario ${user_id}`, error);
      throw new RpcException('Error vaciando el carrito.');
    }
  }

  async verifyProductAvailability(productId: number, quantity: number) {
    try {
      const isAvailable = await this.client
        .send<boolean>('validate_products', { ids: [productId], quantity })
        .toPromise();

      if (!isAvailable) throw new RpcException('Producto no disponible en la cantidad solicitada.');
      return isAvailable;
    } catch (error) {
      this.logError(`Error verificando disponibilidad del producto ${productId}`, error);
      throw new RpcException('Error verificando disponibilidad del producto.');
    }
  }
}