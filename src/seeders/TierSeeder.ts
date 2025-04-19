import type { EntityManager } from '@mikro-orm/mysql';
import { Seeder } from '@mikro-orm/seeder';
import { Tier } from '../tier/entity/tier.entity';

export class TierSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const defaults = [
      { type: 'Tier 1', amount: 100 },
      { type: 'Tier 2', amount: 200 },
      { type: 'Tier 3', amount: 300 },
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
