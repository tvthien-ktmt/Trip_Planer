import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ConflictException } from '@nestjs/common';
import { MembershipService } from '../membership/membership.service';

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(async (cb) => cb(prisma)),
            booking: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ id: 1n, status: 'DRAFT' }),
            },
            flightSeat: {
              updateMany: jest.fn(),
            },
            bookingPassenger: {
              findFirst: jest.fn().mockResolvedValue({ id: 1n, bookingId: 1n }),
              update: jest.fn(),
            },
          },
        },
        {
          provide: getQueueToken('booking'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: MembershipService,
          useValue: {
            awardPoints: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('selectSeat (Concurrency & Optimistic Locking)', () => {
    it('should reject second concurrent seat lock with ConflictException due to version mismatch', async () => {
      // Mock for Request 1: succeeds (finds the record with version 0) -> returns count 1
      // Mock for Request 2: fails (record version is already 1, WHERE version=0 matches 0 rows) -> returns count 0
      (prisma.flightSeat.updateMany as jest.Mock)
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const bookingId = 1n;
      const seatId = 100n;
      const currentVersion = 0;

      // Execute concurrently using Promise.all to simulate race condition
      const req1 = service.selectSeatForPassenger(bookingId, 1n, seatId, currentVersion);
      const req2 = service.selectSeatForPassenger(bookingId, 1n, seatId, currentVersion);

      const results = await Promise.allSettled([req1, req2]);

      // Assert Request 1 fulfilled
      expect(results[0].status).toBe('fulfilled');
      if (results[0].status === 'fulfilled') {
        expect(results[0].value).toEqual({
          success: true,
          message: 'Ghế đã được giữ tạm thời và gán cho hành khách',
        });
      }

      // Assert Request 2 rejected with ConflictException
      expect(results[1].status).toBe('rejected');
      if (results[1].status === 'rejected') {
        expect(results[1].reason).toBeInstanceOf(ConflictException);
        expect(results[1].reason.message).toBe(
          'Ghế đã được người khác chọn, vui lòng chọn ghế khác',
        );
      }

      // Assert updateMany was called exactly twice with the exact same condition (version: 0)
      expect(prisma.flightSeat.updateMany).toHaveBeenCalledTimes(2);
      expect(prisma.flightSeat.updateMany).toHaveBeenNthCalledWith(1, {
        where: { id: seatId, version: currentVersion, status: 'AVAILABLE' },
        data: { status: 'LOCKED', version: { increment: 1 } },
      });
      expect(prisma.flightSeat.updateMany).toHaveBeenNthCalledWith(2, {
        where: { id: seatId, version: currentVersion, status: 'AVAILABLE' },
        data: { status: 'LOCKED', version: { increment: 1 } },
      });
    });
  });
});
