import { Type } from "class-transformer";
import { IsNumber, IsPositive, Min } from "class-validator";

export class OrderItemDto {

    @IsNumber()
    @IsPositive()
    product_id : number;

    @IsNumber()
    @IsPositive()
    quantity : number; 


    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    public price: number;
}