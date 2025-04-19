import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class DepositRequest {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  email: string;

  @Property()
  user_id: string;

  @Property()
  subscription_plan: string;

  @Property({ default: false })
  status?: boolean = false;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
