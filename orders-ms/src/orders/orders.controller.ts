import { Controller, Logger, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto, PaidOrderDto, UpdateOrderStatusDto } from 'src/orders/dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('order.create')
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    console.log('User ID recibido:', createOrderDto.user_id); 
    return await this.ordersService.createOrder(createOrderDto);
  }

  @MessagePattern('order.details.get')
  async handleGetOrderById(
    @Payload('order_id', ParseUUIDPipe) order_id: string,) {
    return await this.ordersService.findOrderById(order_id);
  }

  @MessagePattern('update_order_status')
  async handleUpdateOrderStatus(
    @Payload() updateOrderStatusDto: UpdateOrderStatusDto) {
    return await this.ordersService.updateOrderStatus(updateOrderStatusDto);
  }

  @EventPattern('payment.succeeded')
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    return this.ordersService.paidOrder(paidOrderDto);
  }

  @MessagePattern('order.cancel')
  async cancelOrder(@Payload('order_id', ParseUUIDPipe) order_id: string) {
    return await this.ordersService.cancelOrder(order_id);
  }

  @MessagePattern('order.expired')
  async handleOrderExpired(@Payload() data: { order_id: string }) {
    return this.ordersService.handleOrderExpired(data.order_id);
  }
}