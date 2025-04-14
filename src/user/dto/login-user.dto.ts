import { IsString, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  password: string;
}
