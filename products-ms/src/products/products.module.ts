import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { NatsModule } from 'src/transports/nats.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [NatsModule, ScheduleModule.forRoot()],
})
export class ProductsModule {}
