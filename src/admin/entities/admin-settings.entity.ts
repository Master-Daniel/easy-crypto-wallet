import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
export class AdminSettings {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ unique: true })
  key!: string;

  @Property()
  value!: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
