import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Tier } from './entity/tier.entity';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MikroOrmModule.forFeature([Tier]), UserModule],
  controllers: [TierController],
  providers: [TierService],
  exports: [TierService],
})
export class TierModule {}
