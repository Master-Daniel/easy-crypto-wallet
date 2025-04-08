/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  InjectionToken,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@mikro-orm/nestjs';
import { AdminSettings } from '../admin/entities/admin-settings.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { CoinMarketDataList } from 'src/types/coinMarketData';

@Injectable()
export class CoinMarketService {
  private readonly logger = new Logger(CoinMarketService.name);
  private isUpdating = false;

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(AdminSettings)
    private readonly adminSettingsRepo: EntityRepository<AdminSettings>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER as InjectionToken) private cacheManager: Cache,
  ) {}

  @Cron('0 */1 * * * *')
  async handleCron() {
    if (this.isUpdating) {
      this.logger.warn('Market update skipped: previous job still running');
      return;
    }

    this.isUpdating = true;
    this.logger.log('Scheduled update: Elite Coin market data');

    try {
      await this.updateMarketData();
    } catch (error) {
      this.logger.error(
        'Scheduled update failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isUpdating = false;
    }
  }

  async fetchCachedMarketData(): Promise<CoinMarketDataList> {
    const data = (await this.cacheManager.get(
      'elite_coin_market_data',
    )) as CoinMarketDataList;
    if (!data) {
      throw new NotFoundException('Market data not found in cache.');
    }
    return data;
  }

  async updateMarketData() {
    const forkedEm = this.em.fork();

    try {
      const settingsRepo = forkedEm.getRepository(AdminSettings);
      const settingsKeys = [
        'elite_coin_key',
        'elite_coin_domain',
        'coin_list',
        'coin_trade_list',
      ];

      const settings = await settingsRepo.find({
        key: { $in: settingsKeys },
      });

      const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

      const apiKey = settingsMap.get('elite_coin_key');
      const domain = settingsMap.get('elite_coin_domain');
      const coinList = settingsMap.get('coin_list');
      const coinTradeList = settingsMap.get('coin_trade_list');

      if (!apiKey || !domain || !coinList || !coinTradeList) {
        throw new Error('Missing one or more required admin settings');
      }

      const API = this.configService.get<string>('COIN_MARKET_API');
      if (!API) {
        throw new Error('COIN_MARKET_API not defined in environment');
      }

      this.logger.log(`Caching admin settings...`);

      for (const [key, value] of settingsMap.entries()) {
        await this.cacheManager.set(`admin_settings:${key}`, value, 0);
      }

      this.logger.log('Admin settings cached successfully');

      this.logger.log(`Fetching market data from ${API}...`);
      const res = await fetch(`${API}/coin/by-ids?ids=${coinList}`, {
        headers: {
          'x-api-key': apiKey,
          origin: domain,
        },
      });

      if (!res.ok) {
        this.logger.error(res);
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }

      const marketData = await res.json();

      await this.cacheManager.set(
        'elite_coin_market_data',
        marketData,
        30 * 60 * 1000,
      );

      this.logger.log('Market data updated and cached successfully');
    } catch (error) {
      this.logger.error(
        'Market data update failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
