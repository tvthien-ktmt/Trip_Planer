import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BookingService } from '../booking/booking.service';
import * as crypto from 'crypto';
import * as qs from 'qs';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private bookingService: BookingService,
  ) {}

  async initiatePayment(bookingId: bigint, userId: bigint) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== 'DRAFT') {
      throw new BadRequestException('Invalid booking for payment');
    }

    // BE-009 fix: ownership check — user can only pay for their own booking
    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }

    // BE-054 fix: Check if payment already exists and is SUCCESS
    const existingPayment = await this.prisma.extended.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment && existingPayment.status === 'SUCCESS') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    const { paymentUrl } = await this.prisma.extended.$transaction(async (tx) => {
      // Transition booking to PENDING_PAYMENT before payment initiation (BE-090)
      const currentBooking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (currentBooking && this.bookingService.canTransition(currentBooking.status, 'PENDING_PAYMENT')) {
        await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'PENDING_PAYMENT', userId);
      }

      const vnpayUrl = this.configService.get('VNPAY_URL') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const url = `${vnpayUrl}?vnp_TxnRef=${bookingId}&vnp_Amount=${booking.totalAmount.mul(100).toNumber()}`;
      const idempotencyKey = `PAY_VNPAY_${bookingId}_${Date.now()}`;

      if (existingPayment) {
        const r = await tx.payment.updateMany({
          where: { id: existingPayment.id, status: 'PENDING' },
          data: { status: 'PENDING', idempotencyKey },
        });
        if (r.count === 0) {
          throw new BadRequestException('Payment already completed for this booking');
        }
      } else {
        await tx.payment.create({
          data: {
            bookingId,
            method: 'VNPAY',
            amount: booking.totalAmount,
            status: 'PENDING',
            idempotencyKey,
          },
        });
      }

      return { paymentUrl: url };
    });

    return { paymentUrl };
  }

  async vnpayCallback(vnpayParams: any, ip?: string) {
    const secureHash = vnpayParams['vnp_SecureHash'];
    delete vnpayParams['vnp_SecureHash'];
    delete vnpayParams['vnp_SecureHashType'];

    const sortedParams = Object.keys(vnpayParams)
      .sort()
      .reduce(
        (result: Record<string, any>, key) => {
          result[key] = vnpayParams[key];
          return result;
        },
        {} as Record<string, any>,
      );

    const secretKey = this.configService.get('VNPAY_HASH_SECRET');
    if (!secretKey) {
      throw new BadRequestException('VNPay configuration missing');
    }
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    // BE-053 fix: Replace deprecated new Buffer() with Buffer.from()
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const receivedBuf = Buffer.from(secureHash || '');
    const signedBuf = Buffer.from(signed);
    const isValid =
      receivedBuf.length === signedBuf.length &&
      crypto.timingSafeEqual(receivedBuf, signedBuf);

    if (!isValid) {
      throw new BadRequestException('Invalid checksum');
    }

    const bookingId = BigInt(vnpayParams['vnp_TxnRef']);
    const responseCode = vnpayParams['vnp_ResponseCode'];

    // Transaction with Idempotency check + BE-011 fix: use state machine
    await this.prisma.extended.$transaction(async (tx: any) => {
      const payment = await tx.payment.findUnique({
        where: { bookingId },
        include: { booking: true },
      });

      if (!payment) throw new BadRequestException('Payment not found');

      // Idempotency: If already SUCCESS, just return
      if (payment.status === 'SUCCESS') {
        return { RspCode: '00', Message: 'Confirm Success' };
      }

      if (responseCode === '00') {
        // R3-BE-008: Verify VNPay amount
        const vnpAmount = parseInt(vnpayParams['vnp_Amount']);
        const expectedAmount = payment.amount.toNumber() * 100;
        
        if (vnpAmount !== expectedAmount) {
          throw new BadRequestException('Invalid payment amount');
        }

        const updateResult = await tx.payment.updateMany({
          where: { id: payment.id, status: 'PENDING' },
          data: {
            status: 'SUCCESS',
            transactionRef: vnpayParams['vnp_TransactionNo'],
          },
        });

        if (updateResult.count === 0) {
          // Already processed by another concurrent request
          return { RspCode: '00', Message: 'Confirm Success' };
        }

        await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'CONFIRMED', null);
      } else {
        const updateResult = await tx.payment.updateMany({
          where: { id: payment.id, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
        
        if (updateResult.count === 0) {
          // Already processed by another concurrent request
          return { RspCode: '00', Message: 'Confirm Success' };
        }

        // Revert booking to CANCELLED if payment failed and release seats
        if (this.bookingService.canTransition(payment.booking.status, 'CANCELLED')) {
          await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'CANCELLED', null);

          const passengers = await tx.bookingPassenger.findMany({
            where: { bookingId }, select: { seatId: true },
          });
          const seatIds = passengers.map((p: any) => p.seatId).filter(Boolean) as bigint[];
          if (seatIds.length) {
            await tx.flightSeat.updateMany({
              where: { id: { in: seatIds }, status: 'LOCKED' },
              data: { status: 'AVAILABLE', version: { increment: 1 } },
            });
          }
        }
      }
    });

    return { RspCode: '00', Message: 'Confirm Success' };
  }

  async initiateSepay(bookingId: bigint, userId: bigint) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== 'DRAFT') {
      throw new BadRequestException('Invalid booking for payment');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }

    const existingPayment = await this.prisma.extended.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment && existingPayment.status === 'SUCCESS') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    const { paymentUrl, transferContent, expiredAt, amount, paymentId } = await this.prisma.extended.$transaction(async (tx) => {
      // Transition booking to PENDING_PAYMENT
      const currentBooking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (currentBooking && this.bookingService.canTransition(currentBooking.status, 'PENDING_PAYMENT')) {
        await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'PENDING_PAYMENT', userId);
      }

      // Generate unique transfer content: PAY + bookingId
      const transferContent = `PAY${bookingId}`;
      const idempotencyKey = `PAY_SEPAY_${bookingId}_${Date.now()}`;
      
      const timeoutMs = parseInt(this.configService.get('PAYMENT_TIMEOUT') || '300000');
      const expiredAt = new Date(Date.now() + timeoutMs);

      let paymentId: bigint;
      if (existingPayment) {
        const r = await tx.payment.update({
          where: { id: existingPayment.id },
          data: { 
            status: 'PENDING', 
            idempotencyKey, 
            transferContent, 
            expiredAt,
            method: 'SEPAY'
          },
        });
        paymentId = r.id;
      } else {
        const r = await tx.payment.create({
          data: {
            bookingId,
            method: 'SEPAY',
            amount: booking.totalAmount,
            status: 'PENDING',
            idempotencyKey,
            transferContent,
            expiredAt,
          },
        });
        paymentId = r.id;
      }

      const sepayUrl = this.configService.get('SEPAY_API_URL') || 'https://qr.sepay.vn/img';
      const account = this.configService.get('SEPAY_ACCOUNT_NUMBER');
      const bank = this.configService.get('SEPAY_BANK_CODE');
      const template = this.configService.get('SEPAY_TEMPLATE') || 'compact';
      const amountNum = booking.totalAmount.toNumber();

      const paymentUrl = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${amountNum}&des=${transferContent}&template=${template}`;

      return { paymentUrl, transferContent, expiredAt, amount: amountNum, paymentId };
    });

    return { paymentUrl, transferContent, expiredAt, amount, paymentId: paymentId.toString() };
  }

  async getPaymentStatus(paymentId: bigint) {
    const payment = await this.prisma.extended.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // Check expiration if still pending
    if (payment.status === 'PENDING' && payment.expiredAt && payment.expiredAt.getTime() < Date.now()) {
      // Transition to EXPIRED and release seats
      await this.prisma.extended.$transaction(async (tx) => {
        const p = await tx.payment.findUnique({ where: { id: paymentId }, include: { booking: true } });
        if (p?.status === 'PENDING') {
          await tx.payment.update({
            where: { id: paymentId },
            data: { status: 'EXPIRED' },
          });

          // Cancel booking and release seats
          if (this.bookingService.canTransition(p.booking.status, 'CANCELLED')) {
            await this.bookingService.updateBookingStatusWithTx(tx, p.bookingId, 'CANCELLED', null);

            const passengers = await tx.bookingPassenger.findMany({
              where: { bookingId: p.bookingId }, select: { seatId: true },
            });
            const seatIds = passengers.map((px) => px.seatId).filter(Boolean) as bigint[];
            if (seatIds.length) {
              await tx.flightSeat.updateMany({
                where: { id: { in: seatIds }, status: 'LOCKED' },
                data: { status: 'AVAILABLE', version: { increment: 1 } },
              });
            }
          }
        }
      });
      return { status: 'EXPIRED' };
    }

    return { status: payment.status };
  }

  async sepayWebhook(payload: any) {
    // Standard SePay webhook format or custom format
    const amount = payload.amount || payload.transferAmount;
    const content = payload.content || payload.transferContent || payload.description;
    const bankAccount = payload.bankAccount || payload.accountNumber;
    
    // Ignore invalid webhooks
    if (!content || !amount) {
      return { success: true };
    }

    await this.prisma.extended.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { transferContent: content.trim() },
        include: { booking: true },
      });

      if (!payment) return;

      if (payment.status === 'SUCCESS' || payment.status === 'LATE_PAYMENT') return;

      const isExpired = payment.expiredAt && payment.expiredAt.getTime() < Date.now();
      const expectedAmount = payment.amount.toNumber();

      if (payment.status === 'EXPIRED' || isExpired) {
        // Late payment (received after expiration)
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'LATE_PAYMENT' },
        });
        return;
      }

      if (payment.status === 'PENDING') {
        if (Number(amount) === expectedAmount) {
          // R5-BE-005 fix: Use updateMany for idempotency (OCC)
          const updateResult = await tx.payment.updateMany({
            where: { id: payment.id, status: 'PENDING' },
            data: { status: 'SUCCESS' },
          });
          if (updateResult.count === 0) return; // Already processed by concurrent request
          await this.bookingService.updateBookingStatusWithTx(tx, payment.bookingId, 'CONFIRMED', null);
        } else {
          // Invalid amount — FAILED path with seat release (R5-DB-009 fix)
          const result = await tx.payment.updateMany({
            where: { id: payment.id, status: 'PENDING' },
            data: { status: 'FAILED' },
          });
          if (result.count === 0) return;
          // Cancel booking and release seats (consistent with VNPay path)
          if (this.bookingService.canTransition(payment.booking.status, 'CANCELLED')) {
            await this.bookingService.updateBookingStatusWithTx(tx, payment.bookingId, 'CANCELLED', null);
            const passengers = await tx.bookingPassenger.findMany({
              where: { bookingId: payment.bookingId }, select: { seatId: true },
            });
            const seatIds = passengers.map((p: any) => p.seatId).filter(Boolean) as bigint[];
            if (seatIds.length) {
              await tx.flightSeat.updateMany({
                where: { id: { in: seatIds }, status: 'LOCKED' },
                data: { status: 'AVAILABLE', version: { increment: 1 } },
              });
            }
          }
        }
      }
    });

    return { success: true };
  }

  async requestRefund(paymentId: bigint, reason: string, userId: bigint) {
    const payment = await this.prisma.extended.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment || payment.status !== 'SUCCESS')
      throw new BadRequestException('Payment is not eligible for refund');

    if (payment.booking.userId !== userId)
      throw new ForbiddenException("Cannot refund another user's payment");

    // BE-055 fix: Check if refund already REQUESTED
    const existingRefund = await this.prisma.extended.refund.findFirst({
      where: { paymentId, status: 'REQUESTED' },
    });
    if (existingRefund) {
      throw new BadRequestException('A refund request already exists for this payment');
    }

    return this.prisma.extended.refund.create({
      data: {
        paymentId,
        amount: payment.amount,
        reason,
        status: 'REQUESTED',
      },
    });
  }
}
