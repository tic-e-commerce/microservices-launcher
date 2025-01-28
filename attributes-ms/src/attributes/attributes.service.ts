import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { Attribute, PrismaClient } from '@prisma/client';

@Injectable()
export class AttributesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AttributesService.name);
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database welcome');
  }

  async create(createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    const { attribute_name, attribute_type } = createAttributeDto;

    const newAttribute = await this.attribute.create({
      data: {
        attribute_name,
        attribute_type,
      },
    });

    this.logger.log(`Attribute created with ID: ${newAttribute.attribute_id}`);
    return newAttribute;
  }

  async findAll(): Promise<Attribute[]> {
    const attributes = await this.attribute.findMany();
    this.logger.log(`Fetched ${attributes.length} attributes`);
    return attributes;
  }

  async findOne(id: number): Promise<Attribute | null> {
    const attribute = await this.attribute.findUnique({
      where: { attribute_id: id },
    });

    if (attribute) {
      this.logger.log(`Fetched attribute with ID: ${id}`);
    } else {
      this.logger.warn(`Attribute with ID: ${id} not found`);
    }

    return attribute;
  }

  async update(
    id: number,
    updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    if (!updateAttributeDto) {
      throw new Error('updateAttributeDto is undefined');
    }

    const updatedAttribute = await this.attribute.update({
      where: { attribute_id: id },
      data: updateAttributeDto,
    });

    this.logger.log(`Updated attribute with ID: ${id}`);
    return updatedAttribute;
  }

  async remove(id: number): Promise<Attribute> {
    const deletedAttribute = await this.attribute.delete({
      where: { attribute_id: id },
    });

    this.logger.log(`Deleted attribute with ID: ${id}`);
    return deletedAttribute;
  }
}
