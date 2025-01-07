import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Controller()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @MessagePattern('create_image')
  create(@Payload() createImageDto: CreateImageDto) {
    return this.imageService.create(createImageDto);
  }

  @MessagePattern('find_all_image')
  findAll() {
    return this.imageService.findAll();
  }

  @MessagePattern('find_one_image')
  findOne(@Payload() id: number) {
    return this.imageService.findOne(id);
  }

  @MessagePattern('update_image')
  update(@Payload() payload: { id: number; updateImageDto: UpdateImageDto }) {
    console.log('Received payload:', payload);

    if (!payload || !payload.updateImageDto) {
      throw new RpcException('Invalid update payload');
    }

    const { id, updateImageDto } = payload;
    return this.imageService.update(id, updateImageDto);
  }

  @MessagePattern('remove_image')
  remove(@Payload() id: number) {
    return this.imageService.remove(id);
  }
}
