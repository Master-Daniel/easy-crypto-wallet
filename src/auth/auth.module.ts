import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/user/entities/user.entity';
import { AuthController } from './auth.controller';
import { MailService } from 'src/utils/send-mail.util';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
