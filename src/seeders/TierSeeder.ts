import type { EntityManager } from '@mikro-orm/mysql';
import { Seeder } from '@mikro-orm/seeder';
import { Tier } from '../tier/entity/tier.entity';

export class TierSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const defaults = [
      { type: 'Tier 1', max: 1000, min: 500, name: 'name 1', return: 4000 },
      { type: 'Tier 2', max: 2000, min: 1000, name: 'name 3', return: 3000 },
      { type: 'Tier 3', max: 3000, min: 2000, name: 'name 2', return: 5000 },
    ];

    for (const tier of defaults) {
      const exists = await em.findOne(Tier, { type: tier.type });
      if (!exists) {
        em.create(Tier, tier);
      }
    }

    await em.flush();
  }
}
