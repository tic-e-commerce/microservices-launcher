import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaClient, ProductImage } from '@prisma/client';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ImageService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ImageService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createImageDto: CreateImageDto): Promise<ProductImage> {
    const { product_id, image_url, order } = createImageDto;

    const newImage = await this.productImage.create({
      data: {
        product_id,
        image_url,
        order,
      },
    });

    this.logger.log(`Image created with ID: ${newImage.image_id}`);
    return newImage;
  }

  async findAll(): Promise<ProductImage[]> {
    const images = await this.productImage.findMany();
    this.logger.log(`Fetched ${images.length} images`);
    return images;
  }

  async findOne(id: number): Promise<ProductImage | null> {
    const image = await this.productImage.findUnique({
      where: { image_id: id },
    });

    if (image) {
      this.logger.log(`Fetched image with ID: ${id}`);
    } else {
      this.logger.warn(`Image with ID: ${id} not found`);
    }
    return image;
  }

  async update(
    id: number,
    updateImageDto: UpdateImageDto,
  ): Promise<ProductImage> {
    if (!updateImageDto) {
      throw new Error('updateImageDto is undefined');
    }

    const dataToUpdate: any = { ...updateImageDto };

    const updatedImage = await this.productImage.update({
      where: { image_id: id },
      data: dataToUpdate,
    });

    this.logger.log(`Updated image with ID: ${id}`);
    return updatedImage;
  }

  async remove(id: number): Promise<ProductImage> {
    const deletedImage = await this.productImage.delete({
      where: { image_id: id },
    });

    this.logger.log(`Deleted image with ID: ${id}`);
    return deletedImage;
  }
}
