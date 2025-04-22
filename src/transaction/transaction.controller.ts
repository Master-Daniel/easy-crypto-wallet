import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entity/transaction.entity';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() dto: TransactionDto): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    const txn = await this.transactionService.findOne(id);
    if (!txn) throw new NotFoundException(`Transaction not found: ${id}`);
    return txn;
  }

  @Get('/user/:id')
  async findOneByUserId(@Param('id') id: string): Promise<Transaction[]> {
    const txn = await this.transactionService.findOneByUserId(id);
    if (!txn) throw new NotFoundException(`Transaction not found: ${id}`);
    return txn;
  }
}
