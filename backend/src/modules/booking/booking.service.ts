import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomBytes } from 'crypto';

import { MembershipService } from '../membership/membership.service';

export const BOOKING_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};


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
      const existing = await this.prisma.extended.booking.findUnique({
        where: { bookingCode },
      });
      if (!existing) isUnique = true;
    }

    const booking = await this.prisma.extended.booking.create({
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

  async verifyOwnership(bookingId: bigint, userId: bigint) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }
    return booking;
  }

  async getBooking(bookingId: bigint, userId: bigint) {
    await this.verifyOwnership(bookingId, userId);
    return this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
      include: {
        passengers: true,
        items: true,
        statusHistory: true,
        payment: {
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async selectSeatForPassenger(bookingId: bigint, passengerId: bigint, seatId: bigint, currentVersion: number) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== 'DRAFT')
      throw new BadRequestException('Booking is not in draft state');

    return this.prisma.extended.$transaction(async (tx) => {
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
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
      include: { items: true, passengers: true },
    });
    if (!booking || booking.status !== 'DRAFT')
      throw new BadRequestException('Invalid booking');

    const voucher = await this.prisma.extended.voucher.findUnique({ where: { code } });
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
    await this.prisma.extended.$transaction(async (tx) => {
      const currentBooking = await tx.booking.findUnique({
        where: { id: bookingId },
      });
      if (!currentBooking) throw new BadRequestException('Booking not found');

      if (currentBooking.totalAmount.lessThan(voucher.minOrderAmount)) {
        throw new BadRequestException(
          `Đơn hàng phải từ ${voucher.minOrderAmount} để áp dụng mã này`,
        );
      }

      // Check if user already used this voucher in a CONFIRMED/COMPLETED booking (Fix TOCTOU)
      const existingSuccess: any[] = await tx.$queryRaw`
        SELECT vr.id FROM VoucherRedemption vr
        JOIN Booking b ON vr.bookingId = b.id
        WHERE vr.voucherId = ${voucher.id} AND vr.userId = ${userId} AND b.status IN ('CONFIRMED', 'COMPLETED')
        FOR UPDATE
      `;
      if (existingSuccess.length > 0) {
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

  async addAddons(bookingId: bigint, addons: string[]) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'DRAFT') throw new BadRequestException('Cannot add addons to non-draft booking');

    // R6-BE-013 fix: Look up actual addon price from SystemSetting catalog
    // Default fallback prices (VND) per addon type if SystemSetting not configured
    const DEFAULT_ADDON_PRICES: Record<string, number> = {
      'insurance': 150000,
      'wifi': 200000,
      'transfer': 350000,
    };

    // Try to fetch SystemSetting catalog
    let addonCatalog: Record<string, number> = { ...DEFAULT_ADDON_PRICES };
    try {
      const setting = await this.prisma.extended.systemSetting.findUnique({
        where: { settingKey: 'ANCILLARY_OPTIONS' },
      });
      if (setting?.settingValue) {
        const parsed = JSON.parse(setting.settingValue as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: { id: string; price: number }) => {
            addonCatalog[item.id] = item.price;
          });
        }
      }
    } catch {
      // Fall back to defaults if SystemSetting parse fails
    }

    const items = addons.map(addonId => {
      const unitPrice = addonCatalog[addonId] ?? 200000; // final fallback
      return {
        bookingId,
        itemType: 'ADDON' as const,
        itemRefId: BigInt(isNaN(Number(addonId)) ? 0 : Number(addonId)),
        quantity: 1,
        unitPrice,
        subtotal: unitPrice,
      };
    });

    await this.prisma.extended.$transaction(async (tx) => {
      await tx.bookingItem.deleteMany({
        where: { bookingId, itemType: 'ADDON' }
      });
      if (items.length > 0) {
        await tx.bookingItem.createMany({
          data: items
        });
      }
      await this.recalculateTotalWithTx(tx, bookingId);
    });

    return { success: true };
  }

  // R6-FE-002 fix: addBaggage — persists baggage selections as BookingItems
  async addBaggage(bookingId: bigint, baggage: Record<string, number>) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'DRAFT') throw new BadRequestException('Cannot add baggage to non-draft booking');

    // Baggage price: 50,000 VND per kg (configurable via SystemSetting)
    const BAGGAGE_PRICE_PER_KG = 50000;

    const items = Object.entries(baggage)
      .filter(([, weight]) => weight > 0)
      .map(([passengerId, weight]) => ({
        bookingId,
        itemType: 'BAGGAGE' as const,
        itemRefId: BigInt(isNaN(Number(passengerId)) ? 0 : Number(passengerId)),
        quantity: weight,
        unitPrice: BAGGAGE_PRICE_PER_KG,
        subtotal: weight * BAGGAGE_PRICE_PER_KG,
      }));

    await this.prisma.extended.$transaction(async (tx) => {
      await tx.bookingItem.deleteMany({
        where: { bookingId, itemType: 'BAGGAGE' }
      });
      if (items.length > 0) {
        await tx.bookingItem.createMany({ data: items });
      }
      await this.recalculateTotalWithTx(tx, bookingId);
    });

    return { success: true };
  }

  // R6-FE-002 fix: addMeals — persists meal selections as BookingItems
  async addMeals(bookingId: bigint, meals: Record<string, string>) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'DRAFT') throw new BadRequestException('Cannot add meals to non-draft booking');

    // Meal price: 100,000 VND per selection (configurable via SystemSetting)
    const MEAL_PRICE = 100000;

    const items = Object.entries(meals)
      .filter(([, mealType]) => mealType && mealType !== 'none')
      .map(([passengerId, _mealType]) => ({
        bookingId,
        itemType: 'MEAL' as const,
        itemRefId: BigInt(isNaN(Number(passengerId)) ? 0 : Number(passengerId)),
        quantity: 1,
        unitPrice: MEAL_PRICE,
        subtotal: MEAL_PRICE,
      }));

    await this.prisma.extended.$transaction(async (tx) => {
      await tx.bookingItem.deleteMany({
        where: { bookingId, itemType: 'MEAL' }
      });
      if (items.length > 0) {
        await tx.bookingItem.createMany({ data: items });
      }
      await this.recalculateTotalWithTx(tx, bookingId);
    });

    return { success: true };
  }

  async recalculateTotal(bookingId: bigint) {
    return this.prisma.extended.$transaction(async (tx) => {
      return this.recalculateTotalWithTx(tx, bookingId);
    });
  }

  async recalculateTotalWithTx(tx: any, bookingId: bigint) {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        passengers: true,
        items: true,
      },
    });

    if (!booking) return;

    let total = new Prisma.Decimal(0);
    const seatIds = booking.passengers.map((p: any) => p.seatId).filter((id: any) => id != null) as bigint[];
    
    if (seatIds.length > 0) {
      const seats = await tx.flightSeat.findMany({
        where: { id: { in: seatIds } },
      });
      const fareClassIds = seats.map((s: any) => s.fareClassId);
      const fareClasses = await tx.flightFareClass.findMany({
        where: { id: { in: fareClassIds } },
      });
      
      for (const seat of seats) {
        const fareClass = fareClasses.find((fc: any) => fc.id === seat.fareClassId);
        if (fareClass) {
          total = total.plus(fareClass.basePrice).plus(seat.extraFee);
        }
      }
    }

    // Calculate items
    for (const item of booking.items) {
      total = total.plus(item.subtotal);
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { totalAmount: total },
    });

    return total.toNumber();
  }

  canTransition(from: string, to: string): boolean {
    return BOOKING_TRANSITIONS[from]?.includes(to);
  }

  async updateBookingStatus(bookingId: bigint, newStatus: any, userId: bigint) {
    await this.prisma.extended.$transaction(async (tx) => {
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
    } else if (newStatus === 'CONFIRMED') {
      const payment = await tx.payment.findUnique({ where: { bookingId } });
      if (!payment || payment.status !== 'SUCCESS') {
        throw new BadRequestException('Cannot confirm booking without successful payment');
      }

      // R3-BE-004: Transition seats from LOCKED to BOOKED
      const passengers = await tx.bookingPassenger.findMany({
        where: { bookingId },
        select: { seatId: true },
      });
      const seatIds = passengers.map((p: any) => p.seatId).filter(Boolean) as bigint[];
      if (seatIds.length > 0) {
        await tx.flightSeat.updateMany({
          where: { id: { in: seatIds }, status: 'LOCKED' },
          data: { status: 'BOOKED', version: { increment: 1 } },
        });
      }
    }
  }

  async updatePassengers(bookingId: bigint, passengers: any[]) {
    // BE-012 fix: Actually persist passengers to database
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
      include: { passengers: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'DRAFT') {
      throw new BadRequestException('Cannot update passengers for non-draft booking');
    }

    const createdPassengers = await this.prisma.extended.$transaction(async (tx) => {
      await tx.bookingPassenger.deleteMany({
        where: { bookingId },
      });

      const passengersResult = await Promise.all(
        passengers.map((p) =>
          tx.bookingPassenger.create({
            data: {
              bookingId,
              fullName: p.fullName || p.name || '',
              dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
              nationality: p.nationality || null,
              passportNo: (p.passportNo || p.passport) || null,
              fareClassId: p.fareClassId ? BigInt(p.fareClassId) : null,
            },
          }),
        ),
      );

      // BE-017/018 fix: updatePassengers in transaction + call recalculateTotal
      await this.recalculateTotalWithTx(tx, bookingId);
      
      return passengersResult;
    });

    return { success: true, passengers: createdPassengers };
  }

  async getTicketData(bookingId: bigint) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
      include: {
        passengers: {
          include: {
            seat: {
              include: {
                flight: {
                  include: {
                    departureAirport: true,
                    arrivalAirport: true,
                  }
                }
              }
            }
          }
        },
        items: true,
        payment: {
          select: { method: true, status: true, transactionRef: true },
        },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const firstFlight = booking.passengers?.[0]?.seat?.flight;
    return {
      bookingCode: booking.bookingCode,
      passengers: booking.passengers.map((p: any) => ({
        fullName: p.fullName,
        dateOfBirth: p.dateOfBirth,
        nationality: p.nationality,
        passportNo: p.passportNo,
      })),
      flight: firstFlight ? {
        flightNumber: firstFlight.flightNumber,
        airline: firstFlight.airlineName,
        departure: firstFlight.departureAirport?.iataCode || '',
        destination: firstFlight.arrivalAirport?.iataCode || '',
        departureTime: firstFlight.departureTime,
        arrivalTime: firstFlight.arrivalTime,
      } : null,
      payment: booking.payment ? {
        method: booking.payment.method,
        status: booking.payment.status,
        transactionRef: booking.payment.transactionRef,
      } : null,
    };
  }

  async checkIn(pnr: string, name: string, userId: bigint) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { bookingCode: pnr },
      include: { passengers: true }
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy mã đặt chỗ (PNR)');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập mã đặt chỗ này');
    }

    if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
      throw new BadRequestException('Chuyến bay chưa được xác nhận hoặc đã bị hủy');
    }

    const nameUpper = name.trim().toUpperCase();
    const hasPassenger = booking.passengers.some(p => 
      p.fullName.toUpperCase().includes(nameUpper) || nameUpper.includes(p.fullName.toUpperCase())
    );

    if (!hasPassenger) {
      throw new BadRequestException('Tên hành khách không khớp với mã đặt chỗ');
    }

    // In a real system, this would update check-in status or issue a boarding pass.
    // For now, we return success so the frontend can redirect to the boarding pass.
    return { success: true, bookingId: booking.id.toString(), message: 'Check-in thành công' };
  }
}
