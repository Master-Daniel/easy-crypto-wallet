import { Seeder } from '@mikro-orm/seeder';
import { Admin } from '../admin/entities/admin.entity';
import { EntityManager } from '@mikro-orm/mysql';
import { HashUtil } from '../utils/hash.util';

export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existing = await em.findOne(Admin, { email: 'admin@easycrypto.com' });
    if (existing) return;

    const admin = em.create(Admin, {
      email: 'admin@easycrypto.com',
      password: await HashUtil.hashPassword('secureAdminPassword'),
      role: 'superadmin',
    });

    em.persist(admin);
  }
}
