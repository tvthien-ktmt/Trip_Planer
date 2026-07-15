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

      const booking = await this.prisma.booking.findUnique({
        where: { id: BigInt(bookingId) },
        include: { passengers: true },
      });

      if (
        booking &&
        (booking.status === 'DRAFT' || booking.status === 'PENDING_PAYMENT')
      ) {
        // Cancel the booking
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        // Release locked seats
        const lockedSeatIds = booking.passengers
          .filter((p) => p.seatId != null)
          .map((p) => p.seatId);

        if (lockedSeatIds.length > 0) {
          await this.prisma.flightSeat.updateMany({
            where: { id: { in: lockedSeatIds as bigint[] } },
            data: { status: 'AVAILABLE' },
          });
        }

        console.log(
          `Booking ${bookingId} expired and cancelled. Seats released.`,
        );
      }
    }
  }
}
