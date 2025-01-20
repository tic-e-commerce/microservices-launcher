import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @IsOptional()
  cart_item_id?: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
