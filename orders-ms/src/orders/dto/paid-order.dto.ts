import { IsString, IsUrl, IsUUID } from "class-validator";

export class PaidOrderDto {
    @IsString()
    stripe_payment_id: string;

    @IsString()
    @IsUUID()
    order_id: string;

    @IsString()
    @IsUrl()
    receipt_url: string;  
}