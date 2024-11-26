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
  update(
    @Payload() payload: { id: number; updateProductDto: UpdateProductDto },
  ) {
    const { id, updateProductDto } = payload;
    return this.productsService.update(id, updateProductDto);
  }

  @MessagePattern('remove_product')
  remove(@Payload() id: number) {
    return this.productsService.remove(id);
  }

  @MessagePattern({ cmd: 'validate_products'})
  validateProduct( @Payload() ids:number[])
  {
    return this.productsService.validateProducts(ids);
  }
}
