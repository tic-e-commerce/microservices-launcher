import { IsString, IsUUID, IsEnum } from 'class-validator';
import { order_status } from '@prisma/client'; 

export class UpdateOrderStatusDto {
  @IsUUID()
  order_id: string;

  @IsString()
  @IsEnum(order_status, { message: 'Invalid order status' })
  status: order_status;
}
