import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmNewPassword: string;
}
