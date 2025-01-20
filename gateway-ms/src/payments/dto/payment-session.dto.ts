import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';

export class BillingDetailsDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  phone_number: string;
}

export class PaymentSessionDto {
  @IsString()
  @IsUUID()
  order_id: string;

  @Type(() => Number)
  @IsNotEmpty()
  user_id: number; 

  @IsString()
  currency: string;

  @ValidateNested()
  @Type(() => BillingDetailsDto)
  billing_details: BillingDetailsDto;
}
