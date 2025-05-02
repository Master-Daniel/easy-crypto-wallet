import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TierDto {
  @ApiProperty({
    example: 'Tier 1',
    description: 'Tier name',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'Hello world',
    description: 'name of the tier',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '10000',
    description: 'Maximum Amount',
  })
  @IsString()
  @IsNotEmpty()
  max: number;

  @ApiProperty({
    example: '5000',
    description: 'Minimum Amount',
  })
  @IsString()
  @IsNotEmpty()
  min: number;

  @ApiProperty({
    example: '10000',
    description: 'Profit amount from the signal',
  })
  @IsString()
  @IsNotEmpty()
  return: number;
}
