import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { MailService } from '../utils/send-mail.util';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AdminAuthMiddleware } from '../middleware/admin-auth';
import { Admin } from '../admin/entities/admin.entity';
import { AdminService } from '../admin/admin.service';

@Module({
  imports: [MikroOrmModule.forFeature([User, Wallet, Admin])],
  controllers: [UserController],
  providers: [UserService, MailService, AdminService],
  exports: [UserService],
})
export class UserModule {}
