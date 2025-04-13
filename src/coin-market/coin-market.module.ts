import { Module } from '@nestjs/common';
import { CoinMarketService } from './coin-market.service';
import { AdminSettingsService } from '../admin/admin-settings.service';
import { CoinMarketController } from './coin-market.controller';
import { AdminModule } from '../admin/admin.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminSettings } from '../admin/entities/admin-settings.entity';

@Module({
  imports: [AdminModule, MikroOrmModule.forFeature([AdminSettings])],
  controllers: [CoinMarketController],
  providers: [CoinMarketService, AdminSettingsService],
  exports: [CoinMarketService],
})
export class CoinMarketModule {}
