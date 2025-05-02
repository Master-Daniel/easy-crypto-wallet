import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SignalStatus } from '../entities/signal.entity';

export class SignalDto {
  @ApiProperty({
    example: 'BTC/USDT',
    description: 'Currency pair',
  })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({
    example: '2h, 2min, 2s, 3mo, 4w, 9d',
    description: 'Time frame for signal to always be displayed',
  })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({
    example: '67b4bb8a-41e3-463d-9c83-c079c8830cb7',
    description: 'Primary id of the tier',
  })
  @IsString()
  @IsNotEmpty()
  tier: string;

  @ApiProperty({
    example: '10000',
    description: 'Amount to be staked for the signal',
  })
  @IsString()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: '10000',
    description: 'Profit amount from the signal',
  })
  @IsString()
  @IsNotEmpty()
  return_amount: number;

  @ApiPropertyOptional({
    enum: SignalStatus,
    example: SignalStatus.PENDING,
    description: 'Status of the signal',
  })
  @IsEnum(SignalStatus)
  @IsOptional()
  status?: SignalStatus;
}
