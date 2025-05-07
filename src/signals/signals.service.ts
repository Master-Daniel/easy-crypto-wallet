/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Signals, SignalStatus } from './entities/signal.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { SignalDto } from './dto/signals.dto';
import { Tier } from '../tier/entity/tier.entity';
import { SignalUtils } from '../utils/signal';
import { TradedSignal } from 'src/traded-signals/entities/traded-signals.entity';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectRepository(Signals)
    private readonly signalsRepo: EntityRepository<Signals>,

    @InjectRepository(Tier)
    private readonly tierRepo: EntityRepository<Tier>,

    @InjectRepository(TradedSignal)
    private readonly tradedSignals: EntityRepository<TradedSignal>,
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
      this.logger.error(
        `Signal creation failed: ${error.message}`,
        error.stack,
      );
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

  async updateStatus(
    id: string,
    newStatus: SignalStatus,
  ): Promise<{ message: string; status: number; data?: Signals }> {
    try {
      const signal = await this.signalsRepo.findOne(id);

      if (!signal) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }

      // Validate the new status if needed
      // Example: if you have specific status values
      // const validStatuses = ['active', 'inactive', 'pending'];
      // if (!validStatuses.includes(newStatus)) {
      //   throw new BadRequestException('Invalid status value');
      // }

      signal.status = newStatus;

      this.em.persist(signal);
      await this.em.flush();

      return {
        message: 'Signal status updated successfully',
        status: HttpStatus.OK,
        data: signal,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update signal status: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update signal status');
    }
  }
}
