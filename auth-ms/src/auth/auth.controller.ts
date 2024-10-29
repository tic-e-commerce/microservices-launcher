import { Controller, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  async registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern('auth.login.user')
  async loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @MessagePattern('auth.verify.user')
  async verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
