import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto, ResetPasswordDto } from './dto';
import { PrismaClient, TokenType } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  constructor(
    private readonly jwtService: JwtService,
    private mailerService: MailerService,
  ) {
    super();
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { first_name, last_name, email, password } = registerUserDto;
    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          ...registerUserDto,
          password: bcrypt.hashSync(password, 10),
        },
      });

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User not found',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const { password: __, ...rest } = user;

      return { user: rest, token: await this.signJWT(rest) };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.JWT_SECRET,
      });
      return { user, token: await this.signJWT(user) };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }

  async sendResetPasswordEmail(email: string) {
    try {
      const user = await this.user.findUnique({ where: { email } });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User not found',
        });
      }

      const token = this.jwtService.sign(
        { email: user.email, sub: user.user_id },
        { expiresIn: '1h' },
      );
      const resetUrl = `https://host-app-1041632795031.us-central1.run.app/reset-password?token=${token}`;
      const mailText = `Please click the following link to reset your password: ${resetUrl}`;
      await this.mailerService.sendMail(email, 'Password Reset', mailText);

      await this.token.create({
        data: {
          token: token,
          user_id: user.user_id,
          expires_at: new Date(Date.now() + 3600000),
          token_type: TokenType.reset_password,
        },
      });

      return { message: 'Email sent' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const token = await this.token.findFirst({
        where: {
          token: resetPasswordDto.token,
          token_type: TokenType.reset_password,
          expires_at: {
            gte: new Date(),
          },
          active: true,
        },
      });

      if (!token) {
        throw new RpcException({
          status: 400,
          message: 'Invalid token',
        });
      }

      const payload = this.jwtService.verify(token.token);
      const user = await this.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        throw new RpcException('User not found');
      }

      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.new_password,
        10,
      );
      user.password = hashedPassword;

      await this.user.update({
        where: { user_id: user.user_id },
        data: { password: hashedPassword },
      });

      await this.token.update({
        where: { token_id: token.token_id },
        data: { active: false },
      });

      return { message: 'Password reset' };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
