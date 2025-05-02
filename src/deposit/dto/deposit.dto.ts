import { IsEmail, IsString } from 'class-validator';

export class DepositRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  user_id: string;

  @IsString()
  subscription_plan: string;

  @IsString()
  amount: number;
}
