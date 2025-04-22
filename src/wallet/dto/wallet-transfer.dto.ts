import { IsString, IsNumber } from 'class-validator';

export class WalletTransferDto {
  @IsString()
  user_id: string;

  @IsNumber()
  amount: number;

  @IsString()
  source: string;

  @IsString()
  destination: string;
}
