import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

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

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { first_name,last_name, email, password } = registerUserDto;
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
        user: rest, token: await this.signJWT(rest) };
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
}
