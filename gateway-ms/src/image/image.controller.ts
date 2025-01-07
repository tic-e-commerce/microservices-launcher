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
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('image')
export class ImageController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createImageDto: CreateImageDto) {
    return this.client.send('create_image', createImageDto);
  }

  @Get()
  async findAll() {
    try {
      const images = await firstValueFrom(
        this.client.send('find_all_image', {}),
      );
      return images;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('find_one_image', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    try {
      const payload = { id, updateImageDto };
      const updatedImage = await firstValueFrom(
        this.client.send('update_image', payload),
      );
      return updatedImage;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await firstValueFrom(this.client.send('remove_image', id));
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
