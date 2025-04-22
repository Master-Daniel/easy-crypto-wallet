import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Transaction {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  user_id: string;

  @Property()
  transaction_id: string;

  @Property()
  amount: number;

  @Property()
  source: string;

  @Property()
  destination: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
