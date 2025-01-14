import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReservationsDto, ReservationItemDto } from './dto/reservation.dto';
import { ValidateProductsRequestDto } from './dto/validate-products-request.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('create_product')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern('find_all_products')
  findAll() {
    return this.productsService.findAll();
  }

  @MessagePattern('find_one_product')
  findOne(@Payload() id: number) {
    return this.productsService.findOne(id);
  }

  @MessagePattern('update_product')
  update(
    @Payload() payload: { id: number; updateProductDto: UpdateProductDto },
  ) {
    const { id, updateProductDto } = payload;
    return this.productsService.update(id, updateProductDto);
  }

  @MessagePattern('remove_product')
  remove(@Payload() id: number) {
    return this.productsService.remove(id);
  }

  @MessagePattern('validate_products')
  async validateProducts(
      @Payload() validateProductsRequestDto: ValidateProductsRequestDto,
  ) {
    console.log('Payload recibido:', validateProductsRequestDto);
      return this.productsService.validateProducts(
          validateProductsRequestDto.items,
      );
  }

  @MessagePattern('create_reservations')
  async createReservations(
    @Payload() createReservationsDto: CreateReservationsDto,
  ) {
    const { reservations } = createReservationsDto;
    return this.productsService.createReservations(reservations);
  }

  @MessagePattern('cancel_reservations')
  async cancelReservations(
    @Payload() reservationItemDto: ReservationItemDto[],
  ) {
    return this.productsService.cancelReservations(reservationItemDto);
  }

  @EventPattern('order.processed')
  async handleOrderProcessed(
    @Payload()
    data: {
      order_id: string;
      user_id: number;
      items: { product_id: number; quantity: number; order_id: string }[];
    },
  ) {
    return this.productsService.handleOrderProcessed(data);
  }


  @MessagePattern('get_active_reservations')
  async getActiveReservations(
    @Payload() reservationItemDto: ReservationItemDto[],
  ) {
    return this.productsService.getActiveReservations(reservationItemDto);
  }
}
