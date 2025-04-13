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
  ],
  controllers: [CoinMarketController, AdminSettingsController],
  providers: [],
})
export class AppModule {}
