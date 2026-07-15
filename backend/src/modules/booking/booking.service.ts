import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('booking') private bookingQueue: Queue,
  ) {}

  async createDraftBooking(userId: bigint, type: 'FLIGHT' | 'TOUR') {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    let bookingCode: string = '';
    let isUnique = false;
    while (!isUnique) {
      bookingCode = randomBytes(3).toString('hex').toUpperCase(); // 6 chars
      const existing = await this.prisma.booking.findUnique({
        where: { bookingCode },
      });
      if (!existing) isUnique = true;
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        type,
        status: 'DRAFT',
        bookingCode,
        expiresAt,
      },
    });

    await this.bookingQueue.add(
      'booking-expiry',
      { bookingId: booking.id.toString() },
      { delay: 15 * 60 * 1000 },
    );

    return booking;
  }

  async selectSeat(bookingId: bigint, seatId: bigint, currentVersion: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== 'DRAFT')
      throw new BadRequestException('Booking is not in draft state');

    const result = await this.prisma.flightSeat.updateMany({
      where: {
        id: seatId,
        version: currentVersion,
        status: 'AVAILABLE',
      },
      data: {
        status: 'LOCKED',
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new ConflictException(
        'Ghế đã được người khác chọn, vui lòng chọn ghế khác',
      );
    }

    return { success: true, message: 'Ghế đã được giữ tạm thời' };
  }

  async applyVoucher(bookingId: bigint, code: string, userId: bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true, passengers: true },
    });
    if (!booking || booking.status !== 'DRAFT')
      throw new BadRequestException('Invalid booking');

    const voucher = await this.prisma.voucher.findUnique({ where: { code } });
    if (!voucher) throw new BadRequestException('Mã giảm giá không hợp lệ');

    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validTo)
      throw new BadRequestException(
        'Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng',
      );
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit)
      throw new BadRequestException('Mã giảm giá đã hết số lượng');

    await this.recalculateTotal(bookingId); // Ensure total is fresh
    const updatedBooking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!updatedBooking) throw new BadRequestException('Booking not found');

    if (updatedBooking.totalAmount < voucher.minOrderAmount) {
      throw new BadRequestException(
        `Đơn hàng phải từ ${voucher.minOrderAmount} để áp dụng mã này`,
      );
    }

    // Check unique usage
    const existingUsage = await this.prisma.voucherRedemption.findUnique({
      where: { voucherId_bookingId: { voucherId: voucher.id, bookingId } },
    });
    if (existingUsage)
      throw new BadRequestException('Mã đã được áp dụng cho đơn này rồi');

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === 'FIXED')
      discount = Number(voucher.discountValue);
    else
      discount =
        (Number(updatedBooking.totalAmount) * Number(voucher.discountValue)) /
        100;

    if (
      voucher.maxDiscountAmount &&
      discount > Number(voucher.maxDiscountAmount)
    ) {
      discount = Number(voucher.maxDiscountAmount);
    }

    await this.prisma.$transaction(async (tx) => {
      // Create redemption (fails if unique constraint violated)
      await tx.voucherRedemption.create({
        data: { voucherId: voucher.id, userId, bookingId },
      });

      // Optimistic concurrency control for voucher limits
      if (voucher.usageLimit) {
        const updateResult = await tx.voucher.updateMany({
          where: {
            id: voucher.id,
            usedCount: { lt: voucher.usageLimit },
          },
          data: { usedCount: { increment: 1 } },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException('Mã giảm giá đã hết số lượng');
        }
      } else {
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: { totalAmount: Number(updatedBooking.totalAmount) - discount },
      });
    });

    return { success: true, discount };
  }

  async recalculateTotal(bookingId: bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passengers: true,
        items: true,
      },
    });

    if (!booking) return;

    let total = 0;
    const seatIds = booking.passengers.map(p => p.seatId).filter(id => id != null) as bigint[];
    
    if (seatIds.length > 0) {
      const seats = await this.prisma.flightSeat.findMany({
        where: { id: { in: seatIds } },
      });
      const fareClassIds = seats.map(s => s.fareClassId);
      const fareClasses = await this.prisma.flightFareClass.findMany({
        where: { id: { in: fareClassIds } },
      });
      
      for (const seat of seats) {
        const fareClass = fareClasses.find(fc => fc.id === seat.fareClassId);
        if (fareClass) {
          total += Number(fareClass.basePrice) + Number(seat.extraFee);
        }
      }
    }

    // Calculate items
    for (const item of booking.items) {
      total += Number(item.subtotal);
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { totalAmount: total },
    });

    return total;
  }

  canTransition(from: string, to: string): boolean {
    const transitions: Record<string, string[]> = {
      DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    return transitions[from]?.includes(to);
  }

  async updateBookingStatus(bookingId: bigint, newStatus: any, userId: bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (!this.canTransition(booking.status, newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${newStatus}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: newStatus },
      }),
      this.prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: newStatus,
          changedBy: userId,
        },
      }),
    ]);

    return { success: true, status: newStatus };
  }

  async updatePassengers(bookingId: bigint, passengers: any[]) {
    // Basic implementation
    return { success: true, passengers };
  }
}
