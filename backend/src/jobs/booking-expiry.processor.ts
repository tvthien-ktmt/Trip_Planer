import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('booking')
export class BookingExpiryProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'booking-expiry') {
      const { bookingId } = job.data;

      const booking = await this.prisma.extended.booking.findUnique({
        where: { id: BigInt(bookingId) },
        include: { passengers: true },
      });

      if (
        booking &&
        (booking.status === 'DRAFT' || booking.status === 'PENDING_PAYMENT')
      ) {
        await this.prisma.extended.$transaction(async (tx) => {
          // Conditional cancel
          const result = await tx.booking.updateMany({
            where: { id: booking.id, status: { in: ['DRAFT', 'PENDING_PAYMENT'] } },
            data: { status: 'CANCELLED' },
          });
          if (result.count === 0) return;

          // Release voucher if applied
          const redemption = await tx.voucherRedemption.findFirst({
            where: { bookingId: booking.id },
          });
          if (redemption) {
            await tx.voucherRedemption.delete({ where: { id: redemption.id } });
            await tx.voucher.update({
              where: { id: redemption.voucherId },
              data: { usedCount: { decrement: 1 } },
            });
          }

          // Release locked seats
          const lockedSeatIds = booking.passengers
            .filter((p) => p.seatId != null)
            .map((p) => p.seatId);

          if (lockedSeatIds.length > 0) {
            await tx.flightSeat.updateMany({
              where: { id: { in: lockedSeatIds as bigint[] }, status: 'LOCKED' },
              data: { status: 'AVAILABLE', version: { increment: 1 } },
            });
          }

          // Record history
          await tx.bookingStatusHistory.create({
            data: {
              bookingId: booking.id,
              fromStatus: booking.status,
              toStatus: 'CANCELLED',
              reason: 'Booking expired',
            },
          });
        });

        console.log(
          `Booking ${bookingId} expired and cancelled. Seats released.`,
        );
      }
    }
  }
}
