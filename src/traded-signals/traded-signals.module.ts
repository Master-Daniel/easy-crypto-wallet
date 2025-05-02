import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TradedSignalsController } from './traded-signals.controller';
import { TradedSignalsService } from './traded-signals.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TradedSignal } from './entities/traded-signals.entity';
import { User } from '../user/entities/user.entity';
import { Signals } from '../signals/entities/signal.entity';
import { UserModule } from '../user/user.module';
import { SignalsModule } from '../signals/signals.module';
import { SignalUtils } from '../utils/signal';
import { AuthMiddleware } from '../middleware/auth.middleware';

@Module({
  imports: [
    MikroOrmModule.forFeature([TradedSignal, User, Signals]),
    UserModule,
    SignalsModule,
  ],
  controllers: [TradedSignalsController],
  providers: [TradedSignalsService, SignalUtils],
})
export class TradedSignalsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/', method: RequestMethod.GET },
        { path: '/:user', method: RequestMethod.GET },
        { path: '/create', method: RequestMethod.POST },
        { path: '/delete/:id', method: RequestMethod.DELETE },
        { path: '/update/:id', method: RequestMethod.PATCH },
      );
  }
}
