// traded-signal.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Signals } from '../../signals/entities/signal.entity';
import { v4 as uuid } from 'uuid';
import { User } from '../../user/entities/user.entity';

export enum SignalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity()
export class TradedSignal {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @ManyToOne(() => Signals)
  signal: Signals;

  @ManyToOne(() => User, {
    deleteRule: 'cascade',
    updateRule: 'cascade',
    fieldName: 'user_id',
  })
  user: User;

  @Enum(() => SignalStatus)
  status?: SignalStatus = SignalStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
