import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [PrismaModule, BookingModule],
  controllers: [AdminController, AnalyticsController],
  providers: [AnalyticsService],
})
export class AdminModule {}
