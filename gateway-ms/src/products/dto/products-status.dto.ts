import { IsOptional, IsEnum } from 'class-validator';
import { ProductsStatus, ProductsStatusList } from '../enum/products.enum';

export class ProductsStatusDto {
  @IsOptional()
  @IsEnum(ProductsStatusList, {
    message: `Status must be one of the following values: ${ProductsStatusList}`,
  })
  status: ProductsStatus;
}
