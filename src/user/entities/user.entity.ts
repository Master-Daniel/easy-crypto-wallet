import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { Wallet } from '../../wallet/entities/wallet.entity';

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ unique: true })
  user_id?: string;

  @Property()
  fullname: string;

  @Property({ unique: true })
  email!: string;

  @Property({ default: false })
  email_verified?: boolean;

  @Property()
  email_otp?: string;

  @Property({ unique: true })
  phone?: string;

  @Property()
  password?: string;

  @Property()
  provider?: string;

  @Property()
  providerId?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ nullable: true })
  referralId?: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    owner: true,
    nullable: true,
  })
  wallet?: Wallet;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      user_id: this.user_id,
      fullname: this.fullname,
      email_verified: this.email_verified,
      phone: this.phone,
      provider: this.provider,
      providerId: this.providerId,
      avatarUrl: this.avatarUrl,
      referralId: this.referralId,
      wallet: this.wallet
        ? {
            exchange: this.wallet.exchange,
            trade: this.wallet.trade,
          }
        : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
