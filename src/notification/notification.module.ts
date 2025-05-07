import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Notification } from './entites/notification.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AuthMiddleware } from 'src/middleware/auth.middleware';

@Module({
  imports: [
    MikroOrmModule.forFeature([Notification, User]),
    forwardRef(() => UserModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'notifications', method: RequestMethod.POST },
        { path: 'notifications/user/:userId', method: RequestMethod.GET },
        { path: 'notifications/:id/read', method: RequestMethod.PATCH },
      );
  }
}
