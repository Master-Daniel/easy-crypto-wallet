/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/kyc/kyc.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../utils/send-mail.util';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { KycDto } from './dto/kyc.dto';
import { User } from '../user/entities/user.entity';
import { FileUploadService } from './upload-file.service';
import { KYC, KycStatus } from './entities/kyc-entity';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(KYC) private readonly kycRepo: EntityRepository<KYC>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly fileUploadService: FileUploadService,
    private readonly em: EntityManager,
  ) {}

  async saveKYC(
    // userId: string,
    kycDto: KycDto,
    files: {
      id_image?: Express.Multer.File[];
      id_card_front?: Express.Multer.File[];
      id_card_back?: Express.Multer.File[];
      hand_written_note?: Express.Multer.File[];
    },
  ): Promise<{ message: string; status: number }> {
    const user = await this.userRepo.findOne(kycDto.user_id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check for existing KYC
    const existingKYC = await this.kycRepo.findOne({ user: kycDto.user_id });
    if (existingKYC) {
      throw new BadRequestException('KYC already submitted');
    }

    try {
      // Process all files in parallel
      const [idImagePath, idCardFrontPath, idCardBackPath, handWrittenNoteUrl] =
        await Promise.all([
          files.id_image?.[0]
            ? this.fileUploadService.saveFile(files.id_image[0])
            : null,
          files.id_card_front?.[0]
            ? this.fileUploadService.saveFile(files.id_card_front[0])
            : null,
          files.id_card_back?.[0]
            ? this.fileUploadService.saveFile(files.id_card_back[0])
            : null,
          files.hand_written_note?.[0]
            ? this.fileUploadService.saveFile(files.hand_written_note[0])
            : null,
        ]);

      // Create and save KYC record
      const newKYC = this.kycRepo.create({
        ...kycDto,
        id_image: idImagePath ?? null,
        id_card_front: idCardFrontPath ?? null,
        id_card_back: idCardBackPath ?? null,
        hand_written_note: handWrittenNoteUrl ?? null,
        status: KycStatus.PENDING,
        user,
      });

      this.em.persist(newKYC);
      await this.em.flush();

      //Send confirmation email if provided
      if (user.email) {
        await this.mailService.sendMail(
          user.email,
          user.fullname,
          '',
          'kyc-submission',
          'KYC Submission Successful',
        );
      }

      return {
        message: 'KYC submitted successfully',
        status: 201,
      };
    } catch (error) {
      this.logger.error(`KYC submission failed: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to process KYC submission');
    }
  }
}
