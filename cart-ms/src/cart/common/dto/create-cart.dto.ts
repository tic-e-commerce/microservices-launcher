import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @Type(() => Number)
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

