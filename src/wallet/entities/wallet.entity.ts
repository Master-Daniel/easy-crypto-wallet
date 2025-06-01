import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Wallet {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ default: 0.0 })
  exchange: number = 0;

  @Property({ default: 0.0 })
  trade: number = 0;

  @Property({ default: 0.0 })
  bonus: number = 0;

  @OneToOne(() => User, (user) => user.wallet, { unique: true })
  user!: User;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  toJSON() {
    return {
      id: this.id,
      exchange: this.exchange,
      bonus: this.bonus,
      trade: this.trade,
      user: this.user?.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
