import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Signals } from './entities/signal.entity';
import { TierModule } from '../tier/tier.module';
import { Tier } from '../tier/entity/tier.entity';
import { SignalUtils } from '../utils/signal';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserModule } from '../user/user.module';
import { TradedSignal } from '../traded-signals/entities/traded-signals.entity';
import { TradedSignalsModule } from '../traded-signals/traded-signals.module';
import { AdminAuthMiddleware } from 'src/middleware/admin-auth';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Signals, Tier, TradedSignal]),
    TierModule,
    UserModule,
    AdminModule,
    forwardRef(() => TradedSignalsModule),
  ],
  controllers: [SignalsController],
  providers: [SignalsService, SignalUtils],
  exports: [SignalsService],
})
export class SignalsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/', method: RequestMethod.GET },
        { path: '/:id', method: RequestMethod.GET },
        { path: '/create', method: RequestMethod.POST },
        { path: '/delete/:id', method: RequestMethod.DELETE },
        { path: '/update/:id', method: RequestMethod.PATCH },
      );

    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.GET });
  }
}
