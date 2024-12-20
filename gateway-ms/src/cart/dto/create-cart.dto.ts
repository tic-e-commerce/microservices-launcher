import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number; 
}