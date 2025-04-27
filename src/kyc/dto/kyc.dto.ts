/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger'; // Optional for Swagger docs
import { IdType } from '../enums/id-type.enum'; // Assuming you have an enum for ID types

export class KycDto {
  @ApiProperty({
    example: '67b4bb8a-41e3-463d-9c83-c079c8830cb7',
    description: 'Primary id of the user',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    example: 'United States',
    description: 'Nationality of the user',
  })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({
    enum: IdType,
    example: IdType.PASSPORT,
    description: 'Type of identification document',
  })
  @IsEnum(IdType)
  id_type: IdType;

  @ApiProperty({
    example: 'A12345678',
    description: 'Identification document number',
  })
  @IsString()
  @IsNotEmpty()
  id_number: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image of the ID document',
  })
  @Type(() => Object) // For proper class-transformer handling
  id_image: Express.Multer.File; // Assuming you're using Multer for file uploads

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Front side of ID card',
  })
  @Type(() => Object)
  id_card_front: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Written note been held by the user',
  })
  @Type(() => Object)
  hand_written_note: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Back side of ID card',
  })
  @IsOptional()
  @Type(() => Object)
  id_card_back: Express.Multer.File;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
