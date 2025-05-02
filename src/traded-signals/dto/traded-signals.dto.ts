import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SignalStatus } from '../entities/traded-signals.entity';

export class TradedSignalDto {
  @ApiProperty({
    example: '67b4bb8a-41e3-463d-9c83-c079c8830cb7',
    description: 'Primary id of the signal',
  })
  @IsString()
  @IsNotEmpty()
  signal: string;

  @ApiProperty({
    example: '67b4bb8a-41e3-463d-9c83-c079c8830cb7',
    description: 'Primary id of the user',
  })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiPropertyOptional({
    enum: SignalStatus,
    example: SignalStatus.PENDING,
    description: 'Status of the signal',
  })
  @IsEnum(SignalStatus)
  @IsOptional()
  status?: SignalStatus;
}
