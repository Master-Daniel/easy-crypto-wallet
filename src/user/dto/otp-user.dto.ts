import { IsEmail, IsString } from 'class-validator';

export class OtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  otp: string;
}
