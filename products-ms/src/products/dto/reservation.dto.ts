import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsPositive, IsUUID, ValidateNested } from 'class-validator';

export class CreateReservationsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReservationItemDto) 
    reservations: ReservationItemDto[];
  }

export class ReservationItemDto {
  @IsNotEmpty()
  @Type(() => Number)
  user_id: number;

  @IsInt()
  @IsPositive()
  product_id: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsUUID()
  order_id: string;
}
