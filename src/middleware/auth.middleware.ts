/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async use(
    req: Request & { user?: User & { id?: string } },
    res: Response,
    next: NextFunction,
  ) {
    const SECRET = this.configService.get<string>('SECRET');

    if (!SECRET) {
      throw new HttpException(
        'Server configuration error: SECRET is not defined',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const authHeaders = req.headers.authorization;
    if (authHeaders && authHeaders.split(' ')[1]) {
      const token = authHeaders.split(' ')[1];
      let decoded: any;
      try {
        decoded = jwt.verify(token, SECRET);
      } catch (err) {
        console.log(err);
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      const user = await this.userService.findOne(decoded.id);

      if (!user) {
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }

      req.user = user;
      next();
    } else {
      throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
    }
  }
}
