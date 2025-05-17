import { Seeder } from '@mikro-orm/seeder';
import { AdminSettings } from '../admin/entities/admin-settings.entity';
import { EntityManager } from '@mikro-orm/mysql';

export class AdminSettingsSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const defaults = [
      { key: 'maintenance_mode', value: 'false' },
      { key: 'default_currency', value: 'USD' },
      { key: 'kyc_required', value: 'true' },
      { key: 'coin_list', value: 'bitcoin,ethereum,dogecoin' },
      { key: 'coin_trade_list', value: 'bitcoin,ethereum' },
      { key: 'elite_coin_key', value: 'abc123' },
      { key: 'bonus_percentage', value: '1' },
      { key: 'admin_email', value: 'fxtfxt25@gmail.com' },
      { key: 'admin_alt_email', value: 'vitctorbitten@gmail.com' },
      { key: 'elite_coin_domain', value: 'http://localhost:2000' },
    ];

    for (const setting of defaults) {
      const exists = await em.findOne(AdminSettings, { key: setting.key });
      if (!exists) {
        em.create(AdminSettings, setting);
      }
    }

    await em.flush();
  }
}
