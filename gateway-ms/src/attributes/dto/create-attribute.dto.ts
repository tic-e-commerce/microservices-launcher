import { Type } from 'class-transformer';
import {
  IsString,
  IsIn,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public attribute_name: string;

  @IsString()
  @IsIn(['text', 'number', 'boolean', 'date'])
  public attribute_type: string;

  @IsOptional()
  @Type(() => Date)
  public created_at?: Date;

  @IsOptional()
  @Type(() => Date)
  public updated_at?: Date;
}
