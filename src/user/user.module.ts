import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { MailService } from '../utils/send-mail.util';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AdminAuthMiddleware } from '../middleware/admin-auth';
import { Admin } from '../admin/entities/admin.entity';
import { AdminService } from '../admin/admin.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionModule } from '../transaction/transaction.module';
import { Transaction } from '../transaction/entity/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, Wallet, Admin, Transaction]),
    forwardRef(() => TransactionModule),
    forwardRef(() => WalletModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    MailService,
    AdminService,
    WalletService,
    TransactionService,
    NotificationService,
  ],
  exports: [UserService, MikroOrmModule],
})
export class UserModule {}
