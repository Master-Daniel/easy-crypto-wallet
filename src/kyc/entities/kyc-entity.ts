import { v4 as uuid } from 'uuid';
import { Entity, PrimaryKey, Property, OneToOne, Enum } from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class KYC {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  nationality: string;

  @Property()
  id_type: string;

  @Property()
  id_number: string;

  @Property({ nullable: true })
  id_image?: string;

  @Property({ nullable: true })
  id_card_front?: string;

  @Property({ nullable: true })
  id_card_back?: string;

  @Property({ nullable: true })
  hand_written_note?: string;

  @Enum({ items: () => KycStatus, default: KycStatus.PENDING })
  status: KycStatus = KycStatus.PENDING;

  @OneToOne(() => User, (user) => user.kyc_status, {
    owner: true,
    nullable: true,
  })
  user?: User;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
