import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { AuthModule } from './auth/auth.module';
import mikroOrmConfig from './mikro-orm.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoinMarketController } from './coin-market/coin-market.controller';
import { AdminSettingsController } from './admin/admin-settings.controller';
import { CoinMarketModule } from './coin-market/coin-market.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotifyModule } from './notify.gateway/notify.module';
import { TierController } from './tier/tier.controller';
import { TierModule } from './tier/tier.module';
import { DepositRequestController } from './deposit/deposit-request.controller';
import { DepositRequestModule } from './deposit/deposit-request.module';
import { TransactionModule } from './transaction/transaction.module';
import { KycController } from './kyc/kyc.controller';
import { KycModule } from './kyc/kyc.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SignalsModule } from './signals/signals.module';
import { TradedSignalsModule } from './traded-signals/traded-signals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
      max: 100,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/public',
      exclude: ['/api*'],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    UserModule,
    WalletModule,
    AuthModule,
    CoinMarketModule,
    AdminModule,
    NotifyModule,
    TierModule,
    DepositRequestModule,
    TransactionModule,
    KycModule,
    SignalsModule,
    TradedSignalsModule,
  ],
  controllers: [
    CoinMarketController,
    AdminSettingsController,
    TierController,
    DepositRequestController,
    KycController,
  ],
  providers: [],
})
export class AppModule {}
