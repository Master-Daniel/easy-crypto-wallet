import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Withdraw } from './entities/withdraw.entity';
import { CreateWithdrawDto } from './dto/withdraw.dto';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly withdrawRepo: EntityRepository<Withdraw>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly notificationService: NotificationService,
    private readonly em: EntityManager,
  ) {}

  async create(data: CreateWithdrawDto): Promise<Withdraw> {
    const amount = Number(data.amount);
    const withdraw = new Withdraw();
    withdraw.userId = data.userId;
    withdraw.amount = amount;
    withdraw.account_name = data.account_name;
    withdraw.account_number = data.account_number;
    withdraw.bank_name = data.bank_name;
    withdraw.note = data.note;

    const user = await this.userRepo.findOne(
      { user_id: data.userId },
      { populate: ['wallet'] },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    } else if (user.wallet!.exchange < amount) {
      throw new BadRequestException('Insufficient funds in exchange wallet');
    }

    this.em.persist(withdraw);
    await this.em.flush();

    await this.notificationService.create({
      userId: user.id,
      title: 'Withdrawal Request',
      message: 'Withdrawal request submitted successfully',
    });

    return withdraw;
  }

  async findAll(): Promise<Withdraw[]> {
    return await this.withdrawRepo.findAll();
  }

  async findByUser(userId: string): Promise<Withdraw[]> {
    return await this.withdrawRepo.find({ userId });
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'declined',
  ): Promise<Withdraw> {
    const withdraw = await this.withdrawRepo.findOneOrFail({ id });

    const user = await this.userRepo.findOne(
      { user_id: withdraw.userId },
      { populate: ['wallet'] },
    );

    if (status === 'approved' && user?.wallet) {
      user.wallet.exchange -= Number(withdraw.amount);

      await this.notificationService.create({
        userId: user.id,
        title: 'Deposit Request',
        message: `Your deposit of ${withdraw.amount} has been ${status ? 'approved' : 'declined'}`,
      });

      this.em.persist(user.wallet);
    }

    withdraw.status = status;
    this.em.persist(withdraw);
    await this.em.flush();

    return withdraw;
  }
}
