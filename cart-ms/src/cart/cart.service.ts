import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { CreateCartDto } from './common/dto/create-cart.dto';
import { UpdateCartDto } from './common/dto/update-cart.dto';

@Injectable()
export class CartService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('CartService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() { 
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  async create(createCartDto: CreateCartDto) {
    try {
      const cartItem = await this.cartItem.create({
        data: {
          quantity: createCartDto.quantity,
          productId: createCartDto.productId,
          userId: createCartDto.userId,
        },
      });
      this.logger.log(`Producto agregado al carrito con ID: ${cartItem.id}`);
      return cartItem;
    } catch (error) {
      this.logger.error('Error al agregar producto al carrito', error);
      throw error;
    }
  }

  async findAll(userId: number) {
    try {
      const cartItems = await this.cartItem.findMany({
        where: { userId },
      });
      return cartItems;
    } catch (error) {
      this.logger.error('Error al obtener el carrito', error);
      throw error;
    }
  }

  // async update(id: number, updateCartDto: UpdateCartDto) {
  //   try {
  //     const updatedCartItem = await this.cartItem.update({
  //       where: { id },
  //       data: { quantity: updateCartDto.quantity },
  //     });
  //     this.logger.log(`Producto en el carrito con ID: ${id} actualizado`);
  //     return updatedCartItem;
  //   } catch (error) {
  //     this.logger.error(`Error al actualizar el producto en el carrito con ID: ${id}`, error);
  //     throw error;
  //   }
  // }


  // Actualizar la cantidad en el carrito de compras
  async update(userId: number, productId: number, quantity: number) {
    try {
      return await this.cartItem.updateMany({
        where: { userId, productId },
        data: { quantity },
      });
    } catch (error) {
      this.logger.error('Error al actualizar la cantidad en el carrito', error);
      throw error;
    }
  }
  

  async remove(id: number) {
    try {
      const deletedCartItem = await this.cartItem.delete({
        where: { id },
      });
      this.logger.log(`Producto con ID: ${id} eliminado del carrito`);
      return deletedCartItem;
    } catch (error) {
      this.logger.error(`Error al eliminar el producto con ID: ${id}`, error);
      throw error;
    }
  }

  // async remove(userId: number, productId: number) {
  //   try {
  //     // Eliminar el producto del carrito usando los dos parámetros
  //     const deletedItem = await this.cartItem.deleteMany({
  //       where: {
  //         userId: userId,
  //         productId: productId
  //       }
  //     });
  
  //     // Verificar si se eliminó un item
  //     if (deletedItem.count === 0) {
  //       return { message: 'No se encontró el producto en el carrito para eliminar.' };
  //     }
  
  //     return { message: 'Producto eliminado correctamente del carrito.' };
  //   } catch (error) {
  //     this.logger.error('Error al eliminar el producto del carrito', error);
  //     throw error;
  //   }
  // }
  
  



  async calculateTotal(userId: number) {
    try {
      const cartItems = await this.findAll(userId);
      const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      return { total };
    } catch (error) {
      this.logger.error('Error al calcular el total del carrito', error);
      throw error;
    }
  }

  async clearCart(userId: number) {
    try {
      const deletedItems = await this.cartItem.deleteMany({
        where: { userId },
      });
      this.logger.log(`Carrito vaciado para el usuario con ID: ${userId}`);
      return deletedItems;
    } catch (error) {
      this.logger.error(`Error al vaciar el carrito del usuario con ID: ${userId}`, error);
      throw error;
    }
  }
}


// import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { CreateCartDto } from './dto/create-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';
// import { PrismaClient } from '@prisma/client';
// import { ClientProxy } from '@nestjs/microservices';
// import { NATS_SERVICE } from 'src/config/services';

// @Injectable()
// export class CartService extends PrismaClient implements OnModuleInit {

//   private readonly logger = new Logger('CartService');

//   constructor(
//     @Inject(NATS_SERVICE) private readonly client: ClientProxy,
//   ) {
//     super();
//   }

//   async onModuleInit() {
//     await this.$connect();
//     this.logger.log('Base de datos conectada');
//   } 

//   // create(createCartDto: CreateCartDto) {
//   //   return 'This action adds a new cart';
//   // }

//   // 1. Agregar producto al carrito
//   async create(createCartDto: CreateCartDto) {
//     try {
//       const cartItem = await this.cartItem.create({
//         data: {
//           quantity: createCartDto.quantity,
//           product: { connect: { id: createCartDto.productId } },
//           user: { connect: { id: createCartDto.userId } },
//         },
//       });
//       this.logger.log(`Producto agregado al carrito con ID: ${cartItem.id}`);
//       return cartItem;
//     } catch (error) {
//       this.logger.error('Error al agregar producto al carrito', error);
//       throw error;
//     }
//   }


//   // findAll() {
//   //   return `This action returns all cart`;
//   // }

//   // findOne(id: number) {
//   //   return `This action returns a #${id} cart`;
//   // }

//   // update(id: number, updateCartDto: UpdateCartDto) {
//   //   return `This action updates a #${id} cart`;
//   // }

//   // remove(id: number) {
//   //   return `This action removes a #${id} cart`;
//   // }

//   // 2. Obtener ítems del carrito para un usuario
//   async findAll(userId: number) {
//     try {
//       const cartItems = await this.cartItem.findMany({
//         where: { userId },
//         include: { product: true }, // Incluir detalles del producto
//       });
//       return cartItems.map(item => ({
//         ...item,
//         total: item.quantity * item.product.price, // Cálculo de subtotal por ítem
//       }));
//     } catch (error) {
//       this.logger.error('Error al obtener el carrito', error);
//       throw error;
//     }
//   }

//   // 3. Actualizar cantidad de un producto en el carrito
//   async update(id: number, updateCartDto: UpdateCartDto) {
//     try {
//       const updatedCartItem = await this.cartItem.update({
//         where: { id },
//         data: { quantity: updateCartDto.quantity },
//       });
//       this.logger.log(`Producto en el carrito con ID: ${id} actualizado`);
//       return updatedCartItem;
//     } catch (error) {
//       this.logger.error(`Error al actualizar el producto en el carrito con ID: ${id}`, error);
//       throw error;
//     }
//   }

//   // 4. Eliminar un producto del carrito
//   async remove(id: number) {
//     try {
//       const deletedCartItem = await this.cartItem.delete({
//         where: { id },
//       });
//       this.logger.log(`Producto con ID: ${id} eliminado del carrito`);
//       return deletedCartItem;
//     } catch (error) {
//       this.logger.error(`Error al eliminar el producto con ID: ${id}`, error);
//       throw error;
//     }
//   }

//   // 5. Calcular el total del carrito
//   async calculateTotal(userId: number) {
//     try {
//       const cartItems = await this.findAll(userId);
//       const total = cartItems.reduce((sum, item) => sum + item.total, 0);
//       return { total };
//     } catch (error) {
//       this.logger.error('Error al calcular el total del carrito', error);
//       throw error;
//     }
//   }

//   // 6. Vaciar el carrito
//   async clearCart(userId: number) {
//     try {
//       const deletedItems = await this.cartItem.deleteMany({
//         where: { userId },
//       });
//       this.logger.log(`Carrito vaciado para el usuario con ID: ${userId}`);
//       return deletedItems;
//     } catch (error) {
//       this.logger.error(`Error al vaciar el carrito del usuario con ID: ${userId}`, error);
//       throw error;
//     }
//   }
// }



