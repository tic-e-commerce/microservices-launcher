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
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Controller('attributes')
export class AttributesController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.client.send('create_attribute', createAttributeDto);
  }

  @Get()
  async findAll() {
    try {
      const attributes = await firstValueFrom(
        this.client.send('find_all_attributes', {}),
      );
      return attributes;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const attribute = await firstValueFrom(
        this.client.send('find_one_attribute', id),
      );
      return attribute;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    try {
      const payload = { id, updateAttributeDto };
      const updatedAttribute = await firstValueFrom(
        this.client.send('update_attribute', payload),
      );
      return updatedAttribute;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await firstValueFrom(
        this.client.send('remove_attribute', id),
      );
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
