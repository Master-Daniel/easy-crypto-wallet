import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthMiddleware } from 'src/middleware/admin-auth';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Admin } from './entities/admin.entity';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettings } from './entities/admin-settings.entity';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Admin, AdminSettings])],
  controllers: [AdminController, AdminSettingsController],
  providers: [AdminService, AdminSettingsService],
  exports: [MikroOrmModule, AdminService, AdminSettingsService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        { path: 'admin', method: RequestMethod.POST },
        { path: 'admin', method: RequestMethod.GET },
        { path: 'admin/:id', method: RequestMethod.GET },
        { path: 'admin-settings', method: RequestMethod.POST },
        { path: 'admin-settings/:key', method: RequestMethod.GET },
        { path: 'admin-settings/:key', method: RequestMethod.DELETE },
      );
  }
}
