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
import { ConfigService } from '@nestjs/config';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from '../admin/entities/admin.entity';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  async use(
    req: Request & { admin?: Admin & { id?: string } },
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

    if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
      throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeaders.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      console.log(err);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const { data } = await this.adminService.findById(decoded.id);

    if (!data) {
      throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
    }

    if (
      typeof data?.role !== 'string' ||
      !['admin', 'superadmin'].includes(data.role)
    ) {
      throw new HttpException('Forbidden: Admins only.', HttpStatus.FORBIDDEN);
    }

    req.admin = data as Admin;

    next();
  }
}
