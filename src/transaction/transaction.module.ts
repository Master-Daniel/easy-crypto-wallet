import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Transaction } from './entity/transaction.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Transaction]),
    forwardRef(() => UserModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'transaction', method: RequestMethod.GET },
        { path: 'transaction/user/:id', method: RequestMethod.GET },
      );
  }
}
