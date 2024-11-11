import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  @IsNotEmpty()
  userId: number; // ID del usuario al que pertenece el carrito

  @IsInt()
  @IsNotEmpty()
  productId: number; // ID del producto a agregar al carrito

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number; // Cantidad del producto
}
