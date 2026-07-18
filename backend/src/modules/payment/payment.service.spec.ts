import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BookingService } from '../booking/booking.service';
import * as crypto from 'crypto';
import * as qs from 'qs';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(async (cb) => cb(prisma)),
            payment: {
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            booking: {
              update: jest.fn(),
            },
            bookingStatusHistory: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
        {
          provide: BookingService,
          useValue: {
            updateBookingStatus: jest.fn().mockResolvedValue(undefined),
            updateBookingStatusWithTx: jest.fn().mockResolvedValue(undefined),
            canTransition: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('vnpayCallback (Idempotency)', () => {
    it('should handle duplicate IPN callbacks without double processing', async () => {
      // Generate valid VNPay params
      const vnpayParams: any = {
        vnp_TxnRef: '1',
        vnp_ResponseCode: '00',
        vnp_TransactionNo: '123456',
        vnp_Amount: '1000000',
      };

      const sortedParams = Object.keys(vnpayParams)
        .sort()
        .reduce((result, key) => {
          result[key] = vnpayParams[key];
          return result;
        }, {} as any);
      const signData = qs.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', 'secret');
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      const request1Params = { ...vnpayParams, vnp_SecureHash: signed };
      const request2Params = { ...vnpayParams, vnp_SecureHash: signed };

      // MOCK FOR REQUEST 1: Payment is currently PENDING
      (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1n,
        bookingId: 1n,
        status: 'PENDING',
        booking: { status: 'PENDING_PAYMENT' },
      });
      (prisma.payment.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });

      const res1 = await service.vnpayCallback(request1Params);
      expect(res1).toEqual({ RspCode: '00', Message: 'Confirm Success' });

      // MOCK FOR REQUEST 2: Payment is already SUCCESS (because Request 1 updated it)
      (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1n,
        bookingId: 1n,
        status: 'SUCCESS',
        booking: { status: 'CONFIRMED' },
      });
      (prisma.payment.updateMany as jest.Mock).mockResolvedValueOnce({ count: 0 });

      const res2 = await service.vnpayCallback(request2Params);
      expect(res2).toEqual({ RspCode: '00', Message: 'Confirm Success' });

      // The core assertion: verify update was only called ONCE for the first request
      expect(prisma.payment.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: { id: 1n, status: 'PENDING' },
        data: { status: 'SUCCESS', transactionRef: '123456' },
      });

      // Verify booking update was only called ONCE
      expect(service['bookingService'].updateBookingStatusWithTx).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException cleanly (and not crash with RangeError) when secureHash length mismatches', async () => {
      const vnpayParams: any = {
        vnp_TxnRef: '2',
        vnp_ResponseCode: '00',
        vnp_TransactionNo: '999999',
        vnp_Amount: '1000000',
        vnp_SecureHash: 'short', // Cố tình truyền hash sai độ dài để test lỗi crash của timingSafeEqual
      };

      try {
        await service.vnpayCallback(vnpayParams);
        // If it doesn't throw, fail the test
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Invalid checksum');
      }
    });
  });
});
