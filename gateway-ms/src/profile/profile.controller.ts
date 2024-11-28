import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { NATS_SERVICE } from 'src/config';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { catchError } from 'rxjs';

@Controller('profile')
export class ProfileController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Get(':user_id')
  async getProfile(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.client.send('profile.get', { user_id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    return this.client.send('profile.update', { ...updateProfileDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
