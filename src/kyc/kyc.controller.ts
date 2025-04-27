import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { KycDto } from './dto/kyc.dto';
import { KycService } from './kyc.service';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('/submit')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'id_image', maxCount: 1 },
      { name: 'id_card_front', maxCount: 1 },
      { name: 'id_card_back', maxCount: 1 },
      { name: 'hand_written_note', maxCount: 1 },
    ]),
  )
  async submitKyc(
    @Body() kycDto: KycDto,
    @UploadedFiles()
    files: {
      id_image?: Express.Multer.File[];
      id_card_front?: Express.Multer.File[];
      id_card_back?: Express.Multer.File[];
      hand_written_note?: Express.Multer.File[];
    },
  ) {
    return this.kycService.saveKYC(kycDto, files);
  }
}
