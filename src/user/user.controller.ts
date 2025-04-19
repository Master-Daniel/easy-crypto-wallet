import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { OtpDto } from './dto/otp-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<{
    message: string;
    status: number;
    data: ReturnType<User['toJSON']>;
  }> {
    return await this.userService.create(createUserDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginUserDto): Promise<{
    message: string;
    status: number;
    token: string;
    data: ReturnType<User['toJSON']>;
  }> {
    return await this.userService.login(loginDto);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() otpDto: OtpDto): Promise<{
    message: string;
    status: number;
  }> {
    return await this.userService.verifyOtp(otpDto);
  }

  @Post('/resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto): Promise<{
    message: string;
    status: number;
  }> {
    return await this.userService.resendOtp(resendOtpDto);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() resendOtpDto: ResendOtpDto): Promise<{
    message: string;
    status: number;
  }> {
    return await this.userService.forgotPassword(resendOtpDto);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{
    message: string;
    status: number;
  }> {
    return await this.userService.resetPassword(resetPasswordDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
