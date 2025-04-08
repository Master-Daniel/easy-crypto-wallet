// src/admin/entities/admin.entity.ts
import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
export class Admin {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property({ default: 'admin' })
  role?: string = 'admin';

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
