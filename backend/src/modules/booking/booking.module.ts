import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BullModule } from '@nestjs/bullmq';
import { BookingExpiryProcessor } from '../../jobs/booking-expiry.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'booking',
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingExpiryProcessor],
  exports: [BookingService],
})
export class BookingModule {}
