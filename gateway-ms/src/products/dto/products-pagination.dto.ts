import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common';
import { ProductsStatus, ProductsStatusList } from '../enum/products.enum';

export class ProductsPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductsStatusList, {
    message: `Status must be one of the following values`,
  })
  status: ProductsStatus;
}
