import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('create_product')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern('find_all_products')
  findAll() {
    return this.productsService.findAll();
  }

  @MessagePattern('find_one_product')
  findOne(@Payload() id: number) {
    return this.productsService.findOne(id);
  }

  @MessagePattern('update_product')
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  @MessagePattern('remove_product')
  remove(@Payload() id: number) {
    return this.productsService.remove(id);
  }
}
