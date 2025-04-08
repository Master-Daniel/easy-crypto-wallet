/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  id: string;
  email: string;
  exp: number;
}

export const generateJWT = (
  user: { id: string; email: string },
  configService: ConfigService,
): string => {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  const SECRET = configService.get<string>('SECRET');
  if (!SECRET) {
    throw new Error('JWT secret is not defined in the configuration.');
  }

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(exp.getTime() / 1000),
  };

  return jwt.sign(payload, SECRET);
};
