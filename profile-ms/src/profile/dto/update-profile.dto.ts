import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @Type(() => Number)
  user_id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  first_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  last_name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  phone?: string;
}
