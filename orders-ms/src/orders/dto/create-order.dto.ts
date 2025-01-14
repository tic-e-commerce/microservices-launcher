import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class CreateOrderDto {
    @IsNotEmpty()
    @Type(() => Number)
    user_id: number;
}