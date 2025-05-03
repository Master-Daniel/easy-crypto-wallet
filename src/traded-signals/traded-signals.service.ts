import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TradedSignal } from './entities/traded-signals.entity';
import { TradedSignalDto } from './dto/traded-signals.dto';
import { User } from 'src/user/entities/user.entity';
import { Signals, SignalStatus } from 'src/signals/entities/signal.entity';
import { SignalUtils } from 'src/utils/signal';

@Injectable()
export class TradedSignalsService {
  private readonly logger = new Logger(TradedSignalsService.name);

  constructor(
    @InjectRepository(TradedSignal)
    private readonly tradedSignalsRepo: EntityRepository<TradedSignal>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    @InjectRepository(Signals)
    private readonly signalRepo: EntityRepository<Signals>,
    private readonly em: EntityManager,
    private readonly signalUtils: SignalUtils,
  ) {}

  async fetchAll(user: string): Promise<{
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
    const _user = await this.userRepo.findOne({ id: user });
    if (!_user) {
      throw new NotFoundException('User not found');
    }

    const trades = await this.tradedSignalsRepo.find({ user: { id: user } });

    const tradeData = trades.map((trade) => ({
      id: trade.id,
      signal: { id: trade.signal.id },
      product: trade.signal?.product,
      duration: trade.signal?.duration,
      amount: trade.signal?.amount,
      return: trade.signal?.return_amount,
      status: trade.signal?.status,
    }));

    return {
      message: 'Trades fetched successfully',
      status: HttpStatus.OK,
      data: tradeData,
    };
  }

  async create(tradedSignalDto: TradedSignalDto): Promise<{
    message: string;
    status: number;
  }> {
    const user = await this.userRepo.findOne(
      { id: tradedSignalDto.user },
      { populate: ['wallet'] },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // if (user && user.kyc_status?.status.toLowerCase() == 'pending') {
    //   throw new BadRequestException(
    //     'Please complete your kyc before performing this action',
    //   );
    // }

    const signal = await this.signalRepo.findOne({
      id: tradedSignalDto.signal,
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    if (!user.tier || user.tier.id !== signal.tier) {
      throw new BadRequestException('You are not eligible to place this order');
    }

    if (!this.signalUtils.isSignalActive(signal)) {
      throw new BadRequestException('Signal is no longer active for trading');
    }

    const wallet = user.wallet;

    // Check if wallet exists and trade balance is defined
    if (!wallet || wallet.trade === undefined) {
      throw new BadRequestException('Wallet or trade balance not found');
    }

    // Ensure sufficient balance
    if (wallet.trade < signal.amount) {
      throw new BadRequestException('Insufficient trade balance');
    }

    // Perform the transaction
    wallet.trade -= signal.amount;
    this.em.persist(wallet);
    await this.em.flush();

    const createSignal = this.tradedSignalsRepo.create(tradedSignalDto);
    this.em.persist(createSignal);
    await this.em.flush();

    return {
      message: 'Trade placed successfully',
      status: HttpStatus.CREATED,
    };
  }
}
