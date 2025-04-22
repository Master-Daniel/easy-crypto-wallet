import {
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

@Module({
  imports: [MikroOrmModule.forFeature([Wallet, Transaction, User]), UserModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'wallet/transfer', method: RequestMethod.POST });
  }
}
