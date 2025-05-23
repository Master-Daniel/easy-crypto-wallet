import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transaction/entity/transaction.entity';
import { User } from '../user/entities/user.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserModule } from '../user/user.module';
import { Notification } from '../notification/entites/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Wallet, Transaction, User, Notification]),
    forwardRef(() => UserModule),
  ],
  controllers: [WalletController],
  providers: [WalletService, NotificationService],
  exports: [WalletService, MikroOrmModule],
})
export class WalletModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'wallet/transfer', method: RequestMethod.POST });
  }
}
