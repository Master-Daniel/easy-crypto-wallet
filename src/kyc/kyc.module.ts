// ../kyc/kyc.module.ts
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
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserModule } from '../user/user.module';
import { AdminAuthMiddleware } from '../middleware/admin-auth';
import { Admin } from '../admin/entities/admin.entity';
import { AdminService } from '../admin/admin.service';
import { Notification } from '../notification/entites/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([KYC, User, Admin, Notification]),
    UserModule,
    NotificationModule,
  ],
  controllers: [KycController],
  providers: [
    KycService,
    FileUploadService,
    MailService,
    AdminService,
    NotificationService,
  ],
  exports: [KycService],
})
export class KycModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'kyc/submit', method: RequestMethod.POST });

    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        { path: '/', method: RequestMethod.GET },
        { path: 'kyc/update/:id', method: RequestMethod.PATCH },
      );
  }
}
