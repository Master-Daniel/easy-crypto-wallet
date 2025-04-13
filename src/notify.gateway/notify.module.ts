import { Module } from '@nestjs/common';
import { NotifyGateway } from './';

@Module({
  providers: [NotifyGateway],
  exports: [NotifyGateway],
})
export class NotifyModule {}
