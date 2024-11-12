import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('review')
export class ReviewController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.client.send('create_review', createReviewDto);
  }

  @Get()
  async findAll() {
    try {
      const reviews = await firstValueFrom(
        this.client.send('find_all_review', {}),
      );
      return reviews;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('find_one_review', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    try {
      const payload = { id, updateReviewDto };
      const updatedReview = await firstValueFrom(
        this.client.send('update_review', payload),
      );
      return updatedReview;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await firstValueFrom(
        this.client.send('remove_review', id),
      );
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
