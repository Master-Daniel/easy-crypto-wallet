import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Tier {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  type: string;

  @Property({ nullable: true })
  name?: string;

  @Property()
  max: number;

  @Property()
  min: number;

  @Property()
  return: number;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
