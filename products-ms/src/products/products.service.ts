import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient, Products_Status } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { ProductsStatusList } from './enum/products.enum';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto) {
    console.log('createProductDto', createProductDto);
    try {
      const product = await this.product.create({
        data: {
          ...createProductDto,
          creation_date: new Date(),
          status: createProductDto.status || 'ACTIVE',
        },
      });
      return product;
    } catch (error) {
      this.logger.error('Error creating product:', error);
      throw new RpcException('Error creating product');
    }
  }

  async findAll() {
    try {
      const products = await this.product.findMany();
      return products;
    } catch (error) {
      this.logger.error('Error fetching products:', error);
      throw new RpcException('Error fetching products');
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.product.findUnique({
        where: { product_id: id },
      });
      if (!product) {
        throw new RpcException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Error fetching product with ID ${id}:`, error);
      throw new RpcException('Error fetching product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const status = updateProductDto.status;
      if (
        status &&
        !ProductsStatusList.includes(status as unknown as Products_Status)
      ) {
        throw new Error(`Invalid status value: ${status}`);
      }

      const updatedProduct = await this.product.update({
        where: { product_id: id },
        data: {
          ...updateProductDto,
          update_date: new Date(),
          status: (status as unknown as Products_Status) || undefined, // Solo asigna `status` si es válido y está definido
        },
      });
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Error updating product with ID ${id}:`, error);
      throw new RpcException('Error updating product');
    }
  }

  async remove(id: number) {
    try {
      const deletedProduct = await this.product.delete({
        where: { product_id: id },
      });
      return deletedProduct;
    } catch (error) {
      this.logger.error(`Error deleting product with ID ${id}:`, error);
      throw new RpcException('Error deleting product');
    }
  }
}
