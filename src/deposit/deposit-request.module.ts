import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { DepositRequest } from './entity/deposit-request.entity';
import { DepositRequestController } from './deposit-request.controller';
import { DepositRequestService } from './deposit.service';
import { MailService } from '../utils/send-mail.util';
import { AdminSettings } from '../admin/entities/admin-settings.entity';
import { UserModule } from '../user/user.module';
import { TierService } from '../tier/tier.service';
import { Tier } from '../tier/entity/tier.entity';
import { AdminAuthMiddleware } from '../middleware/admin-auth';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/entities/admin.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';
import { Notification } from '../notification/entites/notification.entity';
import { AdminSettingsService } from 'src/admin/admin-settings.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      DepositRequest,
      AdminSettings,
      Tier,
      Admin,
      Wallet,
      User,
      Notification,
    ]),
    UserModule,
    NotificationModule,
  ],
  controllers: [DepositRequestController],
  providers: [
    DepositRequestService,
    MailService,
    TierService,
    AdminService,
    AdminSettingsService,
    NotificationService,
  ],
  exports: [DepositRequestService],
})
export class DepositRequestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'deposit/request', method: RequestMethod.POST },
        { path: 'deposit/list/:user_id', method: RequestMethod.GET },
      );

    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        { path: 'deposit/list', method: RequestMethod.GET },
        { path: 'deposit/update/:id', method: RequestMethod.PATCH },
      );
  }
}
