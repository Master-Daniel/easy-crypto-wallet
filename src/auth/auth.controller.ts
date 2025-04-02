import { Body, Controller, Post } from '@nestjs/common';
import { ForgottenPasswordDto } from './dto/forgotten-password.dto';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpDto } from 'src/user/dto/otp-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/request-password-reset')
  async create(@Body() forgottenPasswordDto: ForgottenPasswordDto): Promise<{
    message: string;
    status: number;
  }> {
    return this.authService.forgottenPassword(forgottenPasswordDto);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{
    message: string;
    status: number;
  }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() otpDto: OtpDto): Promise<{
    message: string;
    status: number;
  }> {
    return this.authService.verifyOtp(otpDto);
  }
}
