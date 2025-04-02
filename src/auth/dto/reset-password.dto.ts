import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  otp: string;

  @IsString()
  password: string;

  @IsString()
  confirmPassword: string;
}
