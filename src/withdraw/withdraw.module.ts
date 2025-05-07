import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Withdraw } from './entities/withdraw.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Notification } from '../notification/entites/notification.entity';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AdminAuthMiddleware } from '../middleware/admin-auth';
import { Admin } from '../admin/entities/admin.entity';
import { AdminService } from '../admin/admin.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Withdraw, User, Notification, Admin]),
    UserModule,
    NotificationModule,
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService, NotificationService, AdminService],
  exports: [WithdrawService],
})
export class WithdrawModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'withdraw/request', method: RequestMethod.POST },
        { path: 'withdraw/list/:userID', method: RequestMethod.GET },
      );

    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        { path: 'withdraw/list', method: RequestMethod.GET },
        { path: 'withdraw/update/:id/:status', method: RequestMethod.PATCH },
      );
  }
}
