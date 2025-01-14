import {
  IsInt,
  IsString,
  IsUrl,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateImageDto {
  @IsInt()
  @IsPositive()
  public product_id: number;

  @IsString()
  @IsUrl()
  @MaxLength(255)
  public image_url: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  public order: number;
}
