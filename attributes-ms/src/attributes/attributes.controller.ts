import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Controller()
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @MessagePattern('create_attribute')
  create(@Payload() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @MessagePattern('find_all_attributes')
  findAll() {
    return this.attributesService.findAll();
  }

  @MessagePattern('find_one_attribute')
  findOne(@Payload() id: number) {
    return this.attributesService.findOne(id);
  }

  @MessagePattern('update_attribute')
  update(
    @Payload() payload: { id: number; updateAttributeDto: UpdateAttributeDto },
  ) {
    const { id, updateAttributeDto } = payload;

    if (!updateAttributeDto) {
      throw new RpcException('Invalid update payload');
    }

    return this.attributesService.update(id, updateAttributeDto);
  }

  @MessagePattern('remove_attribute')
  remove(@Payload() id: number) {
    return this.attributesService.remove(id);
  }
}
