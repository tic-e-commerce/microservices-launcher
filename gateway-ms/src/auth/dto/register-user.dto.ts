import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  IsDate,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;

  @IsOptional()
  @IsDate()
  registration_date?: Date; // Puede establecerse automáticamente en el backend

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive'; // Valor predeterminado puede ser 'active' en el backend
}
