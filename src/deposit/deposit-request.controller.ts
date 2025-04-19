import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { DepositRequestService } from './deposit.service';
import { DepositRequestDto } from './dto/deposit.dto';
import { UpdateDepositStatusDto } from './dto/deposit-update.dto';

@Controller('deposit')
export class DepositRequestController {
  constructor(private readonly depositService: DepositRequestService) {}

  @Post('/request')
  async request(
    @Body(new ValidationPipe()) depositRequestDto: DepositRequestDto,
  ): Promise<{ message: string; status: number }> {
    return await this.depositService.request(depositRequestDto);
  }

  @Get('/list')
  async findAll() {
    return this.depositService.findAll();
  }

  @Get('/list/:user_id')
  async findByUser(@Param('user_id') userId: string) {
    return this.depositService.findAll(userId);
  }

  @Patch('/update/:deposit_id')
  async updateStatus(
    @Param('deposit_id') deposit_id: string,
    @Body(new ValidationPipe()) updateDto: UpdateDepositStatusDto,
  ): Promise<{ message: string; status: number }> {
    return this.depositService.updateStatus(deposit_id, updateDto);
  }
}
