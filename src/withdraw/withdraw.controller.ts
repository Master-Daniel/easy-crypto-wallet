import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/withdraw.dto';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post('request')
  create(@Body(new ValidationPipe()) dto: CreateWithdrawDto) {
    return this.withdrawService.create(dto);
  }

  @Get('list')
  findAll() {
    return this.withdrawService.findAll();
  }

  @Get('list/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.withdrawService.findByUser(userId);
  }

  @Patch('update/:id/:status')
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'approved' | 'declined',
  ) {
    return this.withdrawService.updateStatus(id, status);
  }
}
