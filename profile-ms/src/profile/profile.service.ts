import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProfileService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProfileService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async getProfile(user_id: number) {
    const profile = await this.user.findUnique({
      where: {
        user_id,
      },
    });

    if (!profile) {
      throw new RpcException({
        status: 404,
        message: 'User not found',
      });
    }

    const { password, ...result } = profile;
    return result;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto) {
    const { user_id, ...data } = updateProfileDto;

    const existingProfile = await this.user.findUnique({
      where: { user_id },
    });

    if (!existingProfile) {
      throw new RpcException({
        status: 404,
        message: 'User not found',
      });
    }

    // Actualizar el usuario con los datos proporcionados
    const updatedProfile = await this.user.update({
      where: { user_id },
      data,
    });

    const { password, ...result } = updatedProfile;
    return result;
  }
}
