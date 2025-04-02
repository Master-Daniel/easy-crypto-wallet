import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  providerId: string;

  @IsOptional()
  @IsString()
  avatarUrl: string;

  @IsOptional()
  @IsString()
  referralId: string;

  @IsOptional()
  @IsString()
  password: string;
}
