import { IsString, IsNumber } from 'class-validator';

export class TransactionDto {
  @IsString()
  user_id: string;

  @IsString()
  transaction_id: string;

  @IsNumber()
  amount: number;

  @IsString()
  source: string;

  @IsString()
  destination: string;
}
