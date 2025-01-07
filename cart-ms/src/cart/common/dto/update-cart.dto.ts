import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @IsOptional()
  id?: number; 

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
