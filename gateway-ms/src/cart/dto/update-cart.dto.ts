import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @IsOptional()
  cart_item_id?: number;

  // @IsNotEmpty()
  // @Type(() => Number)
  // user_id: number;

  // @IsInt()
  // @IsNotEmpty()
  // product_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
