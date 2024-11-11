import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class FindCartDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;
}
