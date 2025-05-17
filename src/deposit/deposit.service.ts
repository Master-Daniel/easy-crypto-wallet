/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
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
import { User } from '../user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class DepositRequestService {
  private readonly logger = new Logger(DepositRequestService.name);

  constructor(
    @InjectRepository(DepositRequest)
    private readonly depositRepo: EntityRepository<DepositRequest>,

    @InjectRepository(Tier)
    private readonly tierRepo: EntityRepository<Tier>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly notificationService: NotificationService,
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

    // const user = await this.userRepo.findOne(
    //   { user_id: depositDto.user_id },
    //   { populate: ['kyc_status'] },
    // );

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

    const user = await this.userRepo.findOne({ user_id: deposit.user_id });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.notificationService.create({
      userId: user.id,
      title: 'Deposit Request',
      message: 'Deposit request submitted successfully',
    });

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
    const forkedEm = this.em.fork();

    const settingsRepo = forkedEm.getRepository(AdminSettings);
    const settingsKeys = ['bonus_percentage'];

    const settings = await settingsRepo.find({
      key: { $in: settingsKeys },
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const bonus = settingsMap.get('bonus_percentage');

    if (!deposit) {
      throw new NotFoundException('Deposit request not found');
    }

    const { status } = updateDto;

    if (status) {
      const user = (await this.userRepo.findOne(
        {
          user_id: deposit.user_id,
        },
        { populate: ['wallet'] },
      )) as User;

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

      const creditBonus = (deposit.amount / 100) * Number(bonus);
      const creditAmount = deposit.amount - creditBonus;

      if (user.referralId) {
        const referredBy = await this.userRepo.findOne({
          referralId: user.referralId,
        });

        if (referredBy) {
          const refree_wallet = referredBy.wallet;
          if (refree_wallet) {
            refree_wallet.exchange =
              (refree_wallet.exchange || 0) + creditBonus;
            this.em.persist([refree_wallet]);
            await this.em.flush();

            await this.notificationService.create({
              userId: referredBy.id,
              title: 'Bonus Credit',
              message: `A bonus of ${creditBonus} has credited into your exchange wallet`,
            });
          }
        }
      } else {
        console.log('referral id not found');
      }

      wallet.exchange = (wallet.exchange || 0) + creditAmount;
      user.tier = tier;
      this.em.persist([wallet, user]);
      await this.em.flush();

      await this.notificationService.create({
        userId: user.id,
        title: 'Deposit Request',
        message: `Your deposit of ${deposit.amount} has been ${status ? 'approved' : 'declined'}`,
      });
    }

    deposit.status = status;
    this.em.persist(deposit);
    await this.em.flush();

    return { message: `Deposit status updated to ${status}`, status: 201 };
  }
}
