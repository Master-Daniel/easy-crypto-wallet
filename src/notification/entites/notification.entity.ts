import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  LoadStrategy,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Notification {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  title: string;

  @Property()
  message: string;

  @Property({ default: false })
  read: boolean = false;

  @ManyToOne(() => User, { strategy: LoadStrategy.JOINED })
  user: User;

  @Property()
  createdAt: Date = new Date();
}
