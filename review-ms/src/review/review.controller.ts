import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern('create_review')
  create(@Payload() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @MessagePattern('find_all_review')
  findAll() {
    return this.reviewService.findAll();
  }

  @MessagePattern('find_one_review')
  findOne(@Payload() id: number) {
    return this.reviewService.findOne(id);
  }

  @MessagePattern('update_review')
  update(@Payload() payload: { id: number; updateReviewDto: UpdateReviewDto }) {
    console.log('Received payload:', payload);

    const { id, updateReviewDto } = payload;
    if (!updateReviewDto) {
      throw new RpcException('Invalid update payload');
    }
    return this.reviewService.update(id, updateReviewDto);
  }

  @MessagePattern('remove_review')
  remove(@Payload() id: number) {
    return this.reviewService.remove(id);
  }
}
