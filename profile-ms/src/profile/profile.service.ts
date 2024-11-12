import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  async getProfile() {
    return {
      name: 'John Doe',
    };
  }
}
