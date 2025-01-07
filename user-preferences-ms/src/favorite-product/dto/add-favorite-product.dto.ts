import { Type } from 'class-transformer';
import { IsPositive } from 'class-validator';

export class AddFavoriteProductDto {
  @Type(() => Number)
  @IsPositive()
  user_id: number;

  @Type(() => Number)
  @IsPositive()
  product_id: number;
}
