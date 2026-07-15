import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, AnalyticsController],
  providers: [AnalyticsService],
})
export class AdminModule {}
