import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Withdraw {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  userId: string;

  @Property()
  account_number: string;

  @Property()
  account_name: string;

  @Property()
  bank_name: string;

  @Property()
  amount: number;

  @Property({ default: 'pending' })
  status?: 'pending' | 'approved' | 'declined' = 'pending';

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
