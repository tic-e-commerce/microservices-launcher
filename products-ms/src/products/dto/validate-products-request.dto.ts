import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQuantityDto {
    @IsNumber()
    product_id: number;

    @IsNumber()
    quantity: number;
}

export class ValidateProductsRequestDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductQuantityDto)
    items: ProductQuantityDto[];
}
