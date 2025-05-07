import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({
    example: 'user_123456',
    description: 'ID of the user requesting the withdrawal',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 250.75,
    description: 'Amount to be withdrawn',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    example: 'Ugochi David',
    description: 'Name of the bank account',
  })
  @IsString()
  account_name: string;

  @ApiProperty({
    example: 'New Bank',
    description: 'Name of the bank',
  })
  @IsString()
  bank_name: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Account number',
  })
  @IsString()
  account_number: string;

  @ApiProperty({
    example: 'Urgent withdrawal for rent',
    description: 'Optional note for the withdrawal',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
