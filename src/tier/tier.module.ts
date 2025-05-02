import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Tier } from './entity/tier.entity';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MikroOrmModule.forFeature([Tier]), UserModule],
  controllers: [TierController],
  providers: [TierService],
  exports: [TierService],
})
export class TierModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'tier', method: RequestMethod.GET },
        { path: 'tier/:id', method: RequestMethod.GET },
      );
  }
}
