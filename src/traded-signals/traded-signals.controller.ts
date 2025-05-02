import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { TradedSignalsService } from './traded-signals.service';
import { TradedSignalDto } from './dto/traded-signals.dto';
import { SignalStatus } from '../signals/entities/signal.entity';

@Controller('traded-signals')
export class TradedSignalsController {
  constructor(private readonly tradedSignalService: TradedSignalsService) {}

  @Post('/create')
  create(
    @Body(new ValidationPipe()) tradedSignalDto: TradedSignalDto,
  ): Promise<{ message: string; status: number }> {
    return this.tradedSignalService.create(tradedSignalDto);
  }

  @Get('/:user')
  fetchAll(@Param('user') user: string): Promise<{
    message: string;
    status: number;
    data: Array<{
      id: string;
      signal: { id: string };
      product?: string;
      duration?: string;
      amount?: number;
      return?: number;
      status?: SignalStatus;
    }>;
  }> {
    return this.tradedSignalService.fetchAll(user);
  }
}
