import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
export enum SignalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity()
export class Signals {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  product: string;

  @Property()
  duration: string;

  @Property()
  tier: string;

  @Property()
  amount: number;

  @Property()
  return_amount: number;

  @Enum(() => SignalStatus)
  status?: SignalStatus = SignalStatus.PENDING;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
