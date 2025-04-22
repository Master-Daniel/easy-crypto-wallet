import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Transaction } from './entity/transaction.entity';
import { TransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: EntityRepository<Transaction>,
    private readonly em: EntityManager = transactionRepo.getEntityManager(),
  ) {}

  async create(dto: TransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepo.create(dto);
    this.em.persist(transaction);
    await this.em.flush();
    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepo.findAll();
  }

  async findOneByUserId(id: string): Promise<Transaction[]> {
    return await this.transactionRepo.findAll({ where: { user_id: id } });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({ id });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }
}
