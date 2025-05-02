import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalDto } from './dto/signals.dto';
import { Signals } from './entities/signal.entity';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalService: SignalsService) {}

  @Post('/create')
  create(
    @Body(new ValidationPipe()) signalDto: SignalDto,
  ): Promise<{ message: string; status: number }> {
    return this.signalService.create(signalDto);
  }

  @Get()
  findAll(): Promise<{
    message: string;
    status: number;
    data: Signals[];
    count?: number;
    success: boolean;
  }> {
    return this.signalService.findAll();
  }
}
