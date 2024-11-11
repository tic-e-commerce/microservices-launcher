import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsUrl,
  IsDate,
  Min,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

enum ProductsStatus {
  active = 'ACTIVE',
  inactive = 'INACTIVE',
  out_of_stock = 'OUT_OF_STOCK',
}

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public product_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  public price: number;

  @IsInt()
  @Min(0)
  public stock: number;

  @IsInt()
  public category_id: number;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  public image_url?: string;

  @IsEnum(ProductsStatus)
  public status: ProductsStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public creation_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public update_date?: Date;
}
