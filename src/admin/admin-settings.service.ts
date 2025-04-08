/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { AdminSettings } from './entities/admin-settings.entity';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectRepository(AdminSettings)
    private readonly settingsRepo: EntityRepository<AdminSettings>,
    private readonly em: EntityManager = settingsRepo.getEntityManager(),
  ) {}

  async bulkUpsert(
    settings: Record<string, string>,
  ): Promise<{ message: string; status: number }> {
    try {
      for (const [key, value] of Object.entries(settings)) {
        const existing = await this.settingsRepo.findOne({ key });

        if (existing) {
          existing.value = value;
          this.em.persist(existing);
        } else {
          const newSetting = this.settingsRepo.create({ key, value });
          this.em.persist(newSetting);
        }
      }

      await this.em.flush();

      return {
        status: HttpStatus.OK,
        message: 'Settings updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<AdminSettings[]> {
    try {
      return this.settingsRepo.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByKey(key: string): Promise<AdminSettings> {
    try {
      const setting = await this.settingsRepo.findOne({ key });
      if (!setting) {
        throw new NotFoundException(`Setting with key "${key}" not found`);
      }
      return setting;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(key: string): Promise<{ message: string }> {
    try {
      const setting = await this.findByKey(key);
      await this.em.removeAndFlush(setting);
      throw new HttpException(
        { message: 'Setting deleted successfully' },
        HttpStatus.OK,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
