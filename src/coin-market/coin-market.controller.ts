import { Controller, Get } from '@nestjs/common';
import { CoinMarketService } from './coin-market.service';
import { CoinMarketDataList } from '../types/coinMarketData';

@Controller('coin-market')
export class CoinMarketController {
  constructor(private readonly coinService: CoinMarketService) {}

  @Get('market-data')
  async getMarketData(): Promise<CoinMarketDataList> {
    return this.coinService.fetchCachedMarketData();
  }
}
