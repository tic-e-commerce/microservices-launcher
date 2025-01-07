import { Type } from 'class-transformer';
import { IsStrongPassword, IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @Type(() => Number)
  @IsNotEmpty()
  user_id: number;

  @IsStrongPassword()
  @IsString()
  old_password: string;

  @IsStrongPassword()
  @IsString()
  new_password: string;
}
