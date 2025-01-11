import { IsString, IsUUID } from 'class-validator';

export class PaymentSessionDto {
  @IsString()
  @IsUUID()
  order_id: string;

  @IsString()
  currency: string;
}
