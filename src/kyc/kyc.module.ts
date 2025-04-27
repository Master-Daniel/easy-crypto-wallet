// src/kyc/kyc.module.ts
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../user/entities/user.entity';
import { KYC } from './entities/kyc-entity';
import { FileUploadService } from './upload-file.service';
import { MailService } from '../utils/send-mail.util';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MikroOrmModule.forFeature([KYC, User]), UserModule],
  controllers: [KycController],
  providers: [KycService, FileUploadService, MailService],
  exports: [KycService],
})
export class KycModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'kyc/submit', method: RequestMethod.POST });
  }
}
