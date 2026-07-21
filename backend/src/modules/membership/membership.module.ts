import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
