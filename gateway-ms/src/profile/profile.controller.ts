import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@Controller('profile')
export class ProfileController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  async getProfile() {
    return this.client.send('profile.get', {});
  }
}
