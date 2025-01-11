import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  // @UseGuards(AuthGuard)
  // @Post()
  // async createOrder(@Body() createOrderDto: CreateOrderDto) {
  //   return this.client.send('create_order', createOrderDto).pipe(
  //     catchError((error) => {
  //       throw new RpcException(error);  
  //     }),  
  //   );
  // }
  @UseGuards(AuthGuard)
  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const user = req.user; 
    createOrderDto.user_id = user.user_id; 
    return this.client.send('create_order', createOrderDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get(':order_id')
  async getOrder(@Param('order_id', ParseUUIDPipe) order_id: string) {
    try {
      const result = await firstValueFrom(
        this.client.send('get_order', { order_id }),
      );
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('cancel')
  async cancelOrder(@Body('order_id', ParseUUIDPipe) order_id: string) {
    return this.client.send('cancel_order', { order_id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
