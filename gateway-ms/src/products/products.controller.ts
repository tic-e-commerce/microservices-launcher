import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NATS_SERVICE } from 'src/config';
import { ProductsPaginationDto } from './dto/products-pagination.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { ProductsStatusDto } from './dto/products-status.dto';
import { PaginationDto } from 'src/common';

@Controller('products')
export class ProductsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.client.send('create_product', createProductDto);
  }

  @Get()
  async findAll(@Query() productsPaginationDto: ProductsPaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.client.send('find_all_products', productsPaginationDto),
      );
      return orders;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('find_one_product', { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':status')
  async findAllByStatus(
    @Param() productsStatusDto: ProductsStatusDto,
    @Query() PaginationDto: PaginationDto,
  ) {
    return this.client
      .send('find_all_products', {
        ...PaginationDto,
        status: productsStatusDto.status,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const updatedProduct = await firstValueFrom(
        this.client.send('update_product', { id, ...updateProductDto }),
      );
      return updatedProduct;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await firstValueFrom(
        this.client.send('delete_product', { id }),
      );
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
