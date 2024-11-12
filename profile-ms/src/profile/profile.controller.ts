import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @MessagePattern('profile.get')
  async getProfile() {
    return this.profileService.getProfile();
  }
}
