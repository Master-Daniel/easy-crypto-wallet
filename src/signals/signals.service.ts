/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Signals } from './entities/signal.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { SignalDto } from './dto/signals.dto';
import { Tier } from '../tier/entity/tier.entity';
import { SignalUtils } from '../utils/signal';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectRepository(Signals)
    private readonly signalsRepo: EntityRepository<Signals>,

    @InjectRepository(Tier)
    private readonly tierRepo: EntityRepository<Tier>,
    private readonly em: EntityManager,
    private readonly signalUtils: SignalUtils,
  ) {}

  async create(
    signalDto: SignalDto,
  ): Promise<{ message: string; status: number }> {
    try {
      const signal = this.signalsRepo.create(signalDto);
      this.em.persist(signal);
      await this.em.flush();
      return {
        message: 'Signal Created successfully',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      this.logger.error(`KYC submission failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create signal');
    }
  }

  async findAll(): Promise<{
    message: string;
    status: number;
    data: Signals[];
    count?: number;
    success: boolean;
  }> {
    const allSignals = await this.signalsRepo.findAll({
      orderBy: { createdAt: 'DESC' },
    });

    if (!allSignals || allSignals.length === 0) {
      return {
        message: 'No signals found',
        status: HttpStatus.NOT_FOUND,
        data: [],
        success: false,
      };
    }

    const filteredSignals = allSignals.filter((signal) => {
      const isActive = this.signalUtils.isSignalActive(signal);
      return isActive;
    });

    if (filteredSignals.length === 0) {
      return {
        message: 'No active signals found',
        status: HttpStatus.NOT_FOUND,
        data: [],
        success: false,
      };
    }

    return {
      message: `Successfully fetched ${filteredSignals.length} active signals`,
      status: HttpStatus.OK,
      data: filteredSignals,
      count: filteredSignals.length,
      success: true,
    };
  }
}
