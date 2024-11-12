import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  public product_id: number;

  @IsInt()
  public user_id: number;

  @IsInt()
  @Min(1)
  @Max(5)
  public rating: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  public comment?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public review_date?: Date;
}
