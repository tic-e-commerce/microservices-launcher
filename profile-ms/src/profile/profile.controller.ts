import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @MessagePattern('profile.get')
  async getProfile(@Payload('user_id') user_id: number) {
    return this.profileService.getProfile(user_id);
  }

  @MessagePattern('profile.update')
  async updateProfile(@Payload() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(updateProfileDto);
  }

  @MessagePattern('profile.changePassword')
  async changePassword(@Payload() changePasswordDto: ChangePasswordDto) {
    return this.profileService.changePassword(changePasswordDto);
  }
}
