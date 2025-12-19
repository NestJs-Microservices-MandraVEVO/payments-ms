import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";



export class PaymentSessionDto {

    @IsString()
    orderId: string;

    @IsString()
    currency: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })//cada uno de los elementos pasa por la validacion de paymentsessionitemdto
    @Type(() => PaymentSessionItemDto)
    items: PaymentSessionItemDto[];
}


export class PaymentSessionItemDto {

    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;
    @IsNumber()
    @IsPositive()
    quantity: number;
}