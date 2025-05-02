/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
        'Server configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new HttpException(
        'Invalid authorization header format',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Verify token and check expiry
      const decoded = jwt.verify(token, SECRET, {
        ignoreExpiration: false,
      }) as {
        id: string;
        exp: number;
      };

      // Additional manual expiry check (redundant but explicit)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.userService.findOne(decoded.id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
