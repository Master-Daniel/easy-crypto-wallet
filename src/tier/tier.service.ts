/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Tier } from './entity/tier.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class TierService {
  private readonly logger = new Logger(TierService.name);
  constructor(
    @InjectRepository(Tier) private readonly tierRepo: EntityRepository<Tier>,
    private readonly em: EntityManager = tierRepo.getEntityManager(),
  ) {
    this.logger.log('UsersService Initialized');
  }

  async findAll(): Promise<Tier[]> {
    try {
      return await this.tierRepo.findAll();
    } catch (error) {
      this.logger.error(
        `Error fetching all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<Tier> {
    try {
      const tier = await this.tierRepo.findOne({ id });

      if (!tier) {
        throw new HttpException(
          { message: 'Tier not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      return tier;
    } catch (error) {
      this.logger.error(
        `Error finding tier by ID: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
