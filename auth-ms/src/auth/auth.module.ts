import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailerService],
})
export class AuthModule {}
