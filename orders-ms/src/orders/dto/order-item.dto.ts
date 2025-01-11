import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class OrderItemDto {
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  user_id: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  product_name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  image_url: string;

  @IsNumber()
  @IsPositive()
  total_cart_price: number;
}
