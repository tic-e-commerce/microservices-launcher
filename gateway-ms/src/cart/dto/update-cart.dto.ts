// import { PartialType } from '@nestjs/mapped-types';
// import { CreateCartDto } from './create-cart.dto';

// export class UpdateCartDto extends PartialType(CreateCartDto) {}


import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { CreateCartDto } from './create-cart.dto';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsInt()
  @IsOptional()
  id?: number; // ID del item en el carrito, opcional para actualización específica

  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number; // Cantidad del producto, opcional para actualización
}
