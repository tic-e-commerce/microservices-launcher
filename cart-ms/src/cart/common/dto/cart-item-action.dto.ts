import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemActionDto {
  @Type(() => Number)
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  product_id: number;
}
