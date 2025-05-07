import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WalletTransferDto } from './dto/wallet-transfer.dto';
import { Wallet } from './entities/wallet.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { Transaction } from '../transaction/entity/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { NotificationService } from 'src/notification/notification.service';

type WalletType = 'exchange' | 'trade';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: EntityRepository<Wallet>,

    @InjectRepository(Transaction)
    private readonly transactionRepo: EntityRepository<Transaction>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly notificationService: NotificationService,
    private readonly em: EntityManager,
  ) {}

  async transfer(dto: WalletTransferDto): Promise<{
    message: string;
    status: number;
  }> {
    const { user_id, amount, source, destination } = dto;

    // Validate wallet types statically
    if (
      !this.isValidWalletType(source) ||
      !this.isValidWalletType(destination)
    ) {
      throw new BadRequestException('Invalid wallet source or destination');
    }

    const user = await this.userRepo.findOne({ id: user_id });

    if (!user || !user.wallet) {
      throw new NotFoundException(`Wallet not found for user ID: ${user_id}`);
    }

    const wallet = user.wallet;

    if (wallet[source] < amount) {
      throw new BadRequestException('Insufficient funds in source wallet');
    } else if (amount <= 0) {
      throw new BadRequestException('Amount cannot be zero (0)');
    }

    wallet[source] -= amount;
    wallet[destination] += amount;

    this.em.persist(wallet);

    const transaction = this.transactionRepo.create({
      user_id,
      transaction_id: uuid(),
      amount,
      source,
      destination,
    });

    await this.notificationService.create({
      userId: user.id,
      title: 'Transfer',
      message: `Your transfer of ${amount} from ${source} to ${destination} was successful`,
    });

    this.em.persist(transaction);
    await this.em.flush();

    return {
      message: 'Transfer successful',
      status: 200,
    };
  }

  private isValidWalletType(value: string): value is WalletType {
    return value === 'exchange' || value === 'trade';
  }
}
