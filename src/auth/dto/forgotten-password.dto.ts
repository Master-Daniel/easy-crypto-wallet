import { IsEmail } from 'class-validator';

export class ForgottenPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
