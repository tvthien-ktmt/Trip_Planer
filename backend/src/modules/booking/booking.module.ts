import { Module, forwardRef } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { VoucherController } from './voucher.controller';
import { BullModule } from '@nestjs/bullmq';
import { BookingExpiryProcessor } from '../../jobs/booking-expiry.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { MembershipModule } from '../membership/membership.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'booking',
    }),
    PrismaModule,
    MembershipModule,
    forwardRef(() => PaymentModule), // R6-BE-001: Need PaymentService for checkout endpoint
  ],
  controllers: [BookingController, VoucherController],
  providers: [BookingService, BookingExpiryProcessor],
  exports: [BookingService],
})
export class BookingModule {}
