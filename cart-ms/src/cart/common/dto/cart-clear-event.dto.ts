import { IsArray, IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CartClearItemDto {
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CartClearEventDto {
  @IsString()
  order_id: string;

  @Type(() => Number)
  @IsNotEmpty()
  user_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartClearItemDto)
  items: CartClearItemDto[];
}
