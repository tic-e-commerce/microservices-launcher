import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaClient, Review } from '@prisma/client';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReviewService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ReviewService.name);
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const { product_id, user_id, rating, comment, review_date } =
      createReviewDto;
    const newReview = await this.review.create({
      data: {
        product_id,
        user_id,
        rating,
        comment,
        review_date: review_date ? new Date(review_date) : new Date(),
      },
    });
    this.logger.log(`Review created with ID: ${newReview.review_id}`);
    return newReview;
  }

  async findAll(): Promise<Review[]> {
    const reviews = await this.review.findMany();
    this.logger.log(`Fetched ${reviews.length} reviews`);
    return reviews;
  }

  async findOne(id: number): Promise<Review | null> {
    const review = await this.review.findUnique({
      where: { review_id: id },
    });
    if (review) {
      this.logger.log(`Fetched review with ID: ${id}`);
    } else {
      this.logger.warn(`Review with ID: ${id} not found`);
    }
    return review;
  }

  async findByProductId(product_id: number): Promise<Review[]> {
    const reviews = await this.review.findMany({
      where: { product_id },
    });
    this.logger.log(
      `Fetched ${reviews.length} reviews for product_ic: ${product_id}`,
    );
    return reviews;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    if (!updateReviewDto) {
      throw new Error('updateReviewDto is undefined');
    }

    const dataToUpdate: any = { ...updateReviewDto };

    if (updateReviewDto.review_date) {
      dataToUpdate.review_date = new Date(updateReviewDto.review_date);
    }

    const updatedReview = await this.review.update({
      where: { review_id: id },
      data: dataToUpdate,
    });

    this.logger.log(`Updated review with ID: ${id}`);
    return updatedReview;
  }

  async remove(id: number): Promise<Review> {
    const deletedReview = await this.review.delete({
      where: { review_id: id },
    });
    this.logger.log(`Deleted review with ID: ${id}`);
    return deletedReview;
  }
}
