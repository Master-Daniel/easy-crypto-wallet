import { v4 as uuid } from 'uuid';
import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  OneToMany,
  Collection,
  ManyToOne,
} from '@mikro-orm/core';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { KYC } from '../../kyc/entities/kyc-entity';
import { TradedSignal } from '../../traded-signals/entities/traded-signals.entity';
import { Tier } from '../../tier/entity/tier.entity';

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

  @ManyToOne(() => Tier, {
    nullable: true,
    eager: true,
  })
  tier?: Tier;

  @Property({ nullable: true })
  referralId?: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    owner: true,
    nullable: true,
  })
  wallet?: Wallet;

  @OneToOne(() => KYC, (kyc) => kyc.user, {
    nullable: true,
    mappedBy: 'user',
  })
  kyc_status?: KYC;

  @OneToMany(() => TradedSignal, (signal) => signal.user)
  tradedSignals = new Collection<TradedSignal>(this);

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
      kyc_status: this.kyc_status,
      phone: this.phone,
      provider: this.provider,
      providerId: this.providerId,
      avatarUrl: this.avatarUrl,
      tier: this.tier
        ? {
            type: this.tier.type,
          }
        : null,
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
