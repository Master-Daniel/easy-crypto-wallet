import { EntityManager } from '@mikro-orm/mysql';
import { Seeder } from '@mikro-orm/seeder';
import { AdminSeeder } from './admin.seeder';
import { AdminSettingsSeeder } from './admin-settings.seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [AdminSeeder, AdminSettingsSeeder]);
  }
}
