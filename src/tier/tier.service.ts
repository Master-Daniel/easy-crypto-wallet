/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Tier } from './entity/tier.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { TierDto } from './dto/tier.dto';

@Injectable()
export class TierService {
  private readonly logger = new Logger(TierService.name);
  constructor(
    @InjectRepository(Tier) private readonly tierRepo: EntityRepository<Tier>,
    private readonly em: EntityManager = tierRepo.getEntityManager(),
  ) {
    this.logger.log('UsersService Initialized');
  }

  async create(tierDto: TierDto) {
    const tier = await this.tierRepo.findOne({ name: tierDto.name });
    if (tier) {
      throw new BadRequestException(`Tier ${tierDto.name} exists`);
    }

    const _create = this.tierRepo.create(tierDto);
    this.em.persist(_create);
    await this.em.flush();

    return {
      message: 'Tier created successfully',
      status: HttpStatus.CREATED,
    };
  }

  async findAll(): Promise<{
    message: string;
    status: number;
    data: Tier[];
  }> {
    try {
      const tiers = await this.tierRepo.findAll();
      return {
        message: 'Tier retrieved successfully',
        status: HttpStatus.OK,
        data: tiers,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<{
    message: string;
    status: number;
    data: Tier;
  }> {
    const tier = await this.tierRepo.findOne({ id });

    if (!tier) {
      throw new HttpException(
        { message: 'Tier not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Tier retrieved successfully',
      status: HttpStatus.OK,
      data: tier,
    };
  }

  async patch(
    id: string,
    updateData: Partial<TierDto>,
  ): Promise<{ message: string; status: number; data: Tier }> {
    try {
      const tier = await this.tierRepo.findOne({ id });
      if (!tier) {
        throw new HttpException(
          { message: 'Tier not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (updateData.name && updateData.name !== tier.name) {
        const existingTier = await this.tierRepo.findOne({
          name: updateData.name,
        });
        if (existingTier) {
          throw new BadRequestException(
            `Tier with name ${updateData.name} already exists`,
          );
        }
      }
      const update = this.tierRepo.assign(tier, updateData);

      this.em.persist(update);
      await this.em.flush();

      return {
        message: 'Tier updated successfully',
        status: HttpStatus.OK,
        data: tier,
      };
    } catch (error) {
      this.logger.error(
        `Error updating tier ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update tier');
    }
  }

  async delete(id: string): Promise<{ message: string; status: number }> {
    try {
      const tier = await this.tierRepo.findOne({ id });

      if (!tier) {
        throw new HttpException(
          { message: 'Tier not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      const usersWithTier = await this.em.count('User', { tier });
      if (usersWithTier > 0) {
        throw new BadRequestException(
          `Cannot delete tier - ${usersWithTier} user(s) are assigned to it`,
        );
      }

      await this.em.removeAndFlush(tier);

      return {
        message: 'Tier deleted successfully',
        status: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting tier ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete tier');
    }
  }
}
