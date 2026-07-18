import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomBytes } from 'crypto';

import { MembershipService } from '../membership/membership.service';
import { encrypt } from '../../common/utils/encryption.util';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('booking') private bookingQueue: Queue,
    private membershipService: MembershipService,
  ) {}

  async createDraftBooking(userId: bigint, type: 'FLIGHT' | 'TOUR') {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    let bookingCode: string = '';
    let isUnique = false;
    while (!isUnique) {
      // BE-038 fix: Booking code should be 12 chars to prevent brute-forcing
      bookingCode = randomBytes(6).toString('hex').toUpperCase(); // 12 chars
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

  async selectSeatForPassenger(bookingId: bigint, passengerId: bigint, seatId: bigint, currentVersion: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== 'DRAFT')
      throw new BadRequestException('Booking is not in draft state');

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.flightSeat.updateMany({
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

      const passenger = await tx.bookingPassenger.findFirst({
        where: { id: passengerId, bookingId: bookingId }
      });
      if (!passenger) {
        throw new BadRequestException('Passenger not found in this booking');
      }

      await tx.bookingPassenger.update({
        where: { id: passengerId },
        data: { seatId },
      });

      return { success: true, message: 'Ghế đã được giữ tạm thời và gán cho hành khách' };
    });
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

    let finalDiscount = 0;
    await this.prisma.$transaction(async (tx) => {
      const currentBooking = await tx.booking.findUnique({
        where: { id: bookingId },
      });
      if (!currentBooking) throw new BadRequestException('Booking not found');

      if (currentBooking.totalAmount < voucher.minOrderAmount) {
        throw new BadRequestException(
          `Đơn hàng phải từ ${voucher.minOrderAmount} để áp dụng mã này`,
        );
      }

      // Check if user already used this voucher in a CONFIRMED/COMPLETED booking
      const existingSuccess = await tx.voucherRedemption.findFirst({
        where: {
          voucherId: voucher.id,
          userId,
          booking: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        },
      });
      if (existingSuccess) {
        throw new BadRequestException('Bạn đã sử dụng voucher này rồi');
      }

      // Check unique usage
      const existingUsage = await tx.voucherRedemption.findUnique({
        where: { voucherId_bookingId: { voucherId: voucher.id, bookingId } },
      });
      if (existingUsage)
        throw new BadRequestException('Mã đã được áp dụng cho đơn này rồi');

      // Calculate discount
      let discount = new Prisma.Decimal(0);
      if (voucher.discountType === 'FIXED')
        discount = voucher.discountValue;
      else
        discount = currentBooking.totalAmount.mul(voucher.discountValue).div(100);

      if (
        voucher.maxDiscountAmount &&
        discount.gt(voucher.maxDiscountAmount)
      ) {
        discount = voucher.maxDiscountAmount;
      }
      finalDiscount = discount.toNumber();

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
        data: { totalAmount: { decrement: discount } },
      });
    });

    return { success: true, discount: finalDiscount };
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

    let total = new Prisma.Decimal(0);
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
          total = total.plus(fareClass.basePrice).plus(seat.extraFee);
        }
      }
    }

    // Calculate items
    for (const item of booking.items) {
      total = total.plus(item.subtotal);
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { totalAmount: total },
    });

    return total.toNumber();
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
    await this.prisma.$transaction(async (tx) => {
      await this.updateBookingStatusWithTx(tx, bookingId, newStatus, userId);
    });

    return { success: true, status: newStatus };
  }

  async updateBookingStatusWithTx(
    tx: any,
    bookingId: bigint,
    newStatus: any,
    changedBy: bigint | null,
  ) {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!this.canTransition(booking.status, newStatus)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${newStatus}`);
    }

    const result = await tx.booking.updateMany({
      where: { id: bookingId, status: booking.status },
      data: { status: newStatus },
    });

    if (result.count === 0) {
      throw new ConflictException('Booking status was modified by another request');
    }

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        fromStatus: booking.status,
        toStatus: newStatus,
        changedBy,
      },
    });

    if (newStatus === 'COMPLETED') {
      await this.membershipService.awardPoints(
        booking.userId,
        booking.totalAmount.toNumber(),
        bookingId,
      );
    }
  }

  async updatePassengers(bookingId: bigint, passengers: any[]) {
    // BE-012 fix: Actually persist passengers to database
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { passengers: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'DRAFT') {
      throw new BadRequestException('Cannot update passengers for non-draft booking');
    }

    const createdPassengers = await this.prisma.$transaction(async (tx) => {
      await tx.bookingPassenger.deleteMany({
        where: { bookingId },
      });

      return await Promise.all(
        passengers.map((p) =>
          tx.bookingPassenger.create({
            data: {
              bookingId,
              fullName: p.fullName || p.name || '',
              dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
              nationality: p.nationality || null,
              passportNo: (p.passportNo || p.passport) ? encrypt(p.passportNo || p.passport) : null,
              fareClassId: p.fareClassId ? BigInt(p.fareClassId) : null,
            },
          }),
        ),
      );
    });

    await this.recalculateTotal(bookingId);

    return { success: true, passengers: createdPassengers };
  }

}
