import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RpcException } from '@nestjs/microservices';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProfileService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async getProfile(user_id: number) {
    try {
      const profile = await this.user.findUnique({
        where: {
          user_id,
        },
      });

      if (!profile) {
        throw new RpcException({
          status: 404,
          message: 'This user not exist',
        });
      }

      const { password, ...result } = profile;
      return result;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto) {
    try {
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
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    try {
      const { user_id, old_password, new_password } = changePasswordDto;
      const existingProfile = await this.user.findUnique({
        where: { user_id },
      });

      if (!existingProfile) {
        throw new RpcException({
          status: 404,
          message: 'User not found',
        });
      }

      const isOldPasswordValid = await bcrypt.compare(
        old_password,
        existingProfile.password,
      );

      if (!isOldPasswordValid) {
        this.logger.error('Invalid old password');
        throw new RpcException({
          status: 400,
          message: 'Invalid old password',
        });
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);

      const updatedProfile = await this.user.update({
        where: { user_id },
        data: { password: hashedNewPassword },
      });

      const { password, ...result } = updatedProfile;

      return result;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
