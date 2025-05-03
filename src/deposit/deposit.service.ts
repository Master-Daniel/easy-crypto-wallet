/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { MailService } from '../utils/send-mail.util';
import { DepositRequest } from './entity/deposit-request.entity';
import { DepositRequestDto } from './dto/deposit.dto';
import { AdminSettings } from '../admin/entities/admin-settings.entity';
import { Tier } from '../tier/entity/tier.entity';
import { UpdateDepositStatusDto } from './dto/deposit-update.dto';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class DepositRequestService {
  private readonly logger = new Logger(DepositRequestService.name);

  constructor(
    @InjectRepository(DepositRequest)
    private readonly depositRepo: EntityRepository<DepositRequest>,

    @InjectRepository(AdminSettings)
    private readonly adminSettingsRepo: EntityRepository<AdminSettings>,

    @InjectRepository(Tier)
    private readonly tierRepo: EntityRepository<Tier>,

    @InjectRepository(Wallet)
    private readonly walletRepo: EntityRepository<Wallet>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly mailService: MailService,
    private readonly em: EntityManager,
  ) {}

  async request(
    depositDto: DepositRequestDto,
  ): Promise<{ message: string; status: number }> {
    const tier = (await this.tierRepo.findOne({
      id: depositDto.subscription_plan,
    })) as Tier;

    if (!tier) {
      throw new HttpException(
        { message: 'Tier not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const user = await this.userRepo.findOne(
      { user_id: depositDto.user_id },
      { populate: ['kyc_status'] },
    );

    // if (user && user.kyc_status?.status.toLowerCase() == 'pending') {
    //   throw new HttpException(
    //     { message: 'Please complete your kyc before performing this action' },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const deposit = this.depositRepo.create({
      email: depositDto.email,
      user_id: depositDto.user_id,
      amount: depositDto.amount,
      subscription_plan: depositDto.subscription_plan,
    });

    this.em.persist(deposit);
    await this.em.flush();

    const forkedEm = this.em.fork();
    const settingsRepo = forkedEm.getRepository(AdminSettings);

    const settingsKeys = ['admin_email', 'admin_alt_email'];

    const settings = await settingsRepo.find({
      key: { $in: settingsKeys },
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const adminEmails = [
      settingsMap.get('admin_email') ?? '',
      settingsMap.get('admin_alt_email') ?? '',
    ];

    const message = [deposit.user_id, deposit.email, tier.type];

    await this.mailService.sendMail(
      adminEmails,
      'Admin',
      message,
      'deposit-request',
      'New Deposit Request',
    );

    return {
      message: 'Deposit request submitted successfully',
      status: 201,
    };
  }

  async findAll(userId?: string): Promise<DepositRequest[]> {
    try {
      if (userId) {
        return this.depositRepo.find(
          { user_id: userId },
          { orderBy: { createdAt: 'DESC' } },
        );
      }
      return this.depositRepo.findAll({ orderBy: { createdAt: 'DESC' } });
    } catch (error) {
      this.logger.error(
        `Error fetching all deposits: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateStatus(
    id: string,
    updateDto: UpdateDepositStatusDto,
  ): Promise<{ message: string; status: number }> {
    const deposit = await this.depositRepo.findOne({ id });

    if (!deposit) {
      throw new NotFoundException('Deposit request not found');
    }

    const { status } = updateDto;

    if (status) {
      const user = (await this.userRepo.findOne({
        user_id: deposit.user_id,
      })) as User;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const wallet = user.wallet;
      if (!wallet) {
        throw new NotFoundException('User Wallet not found');
      }

      const tier = await this.tierRepo.findOne({
        id: deposit.subscription_plan,
      });

      if (!tier) {
        throw new NotFoundException('Tier not found');
      }

      wallet.exchange = wallet.exchange ?? 0;
      wallet.exchange += deposit.amount;
      this.em.persist(wallet);
      await this.em.flush();

      user.tier = tier;
      this.em.persist(user);
      await this.em.flush();
    }

    deposit.status = status;
    this.em.persist(deposit);
    await this.em.flush();

    return { message: `Deposit status updated to ${status}`, status: 201 };
  }
}
