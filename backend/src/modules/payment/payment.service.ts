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
    const booking = await this.prisma.booking.findUnique({
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
    const existingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment && existingPayment.status === 'SUCCESS') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    // Transition booking to PENDING_PAYMENT before payment initiation (BE-090)
    await this.bookingService.updateBookingStatus(bookingId, 'PENDING_PAYMENT', userId);

    const vnpayUrl = this.configService.get('VNPAY_URL') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const paymentUrl = `${vnpayUrl}?vnp_TxnRef=${bookingId}&vnp_Amount=${Number(booking.totalAmount) * 100}`;

    const idempotencyKey = `PAY_VNPAY_${bookingId}_${Date.now()}`;

    if (existingPayment) {
      // Update existing pending payment
      await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: 'PENDING' },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          bookingId,
          method: 'VNPAY',
          amount: booking.totalAmount,
          status: 'PENDING',
          idempotencyKey,
        },
      });
    }

    return { paymentUrl };
  }

  async vnpayCallback(vnpayParams: any) {
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
    await this.prisma.$transaction(async (tx: any) => {
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

        // BE-011 fix: Use state machine transition instead of direct status update
        // PENDING_PAYMENT → CONFIRMED is valid transition
        if (this.bookingService.canTransition(payment.booking.status, 'CONFIRMED')) {
          await tx.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
          });
          // Create history record
          await tx.bookingStatusHistory.create({
            data: {
              bookingId,
              fromStatus: payment.booking.status,
              toStatus: 'CONFIRMED',
              reason: 'Payment confirmed via VNPay callback',
            },
          });
        }
      } else {
        const updateResult = await tx.payment.updateMany({
          where: { id: payment.id, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
        
        if (updateResult.count === 0) {
          // Already processed by another concurrent request
          return { RspCode: '00', Message: 'Confirm Success' };
        }

        // Revert booking to DRAFT if payment failed
        if (this.bookingService.canTransition(payment.booking.status, 'CANCELLED')) {
          await tx.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED' },
          });
        }
      }
    });

    return { RspCode: '00', Message: 'Confirm Success' };
  }

  async requestRefund(paymentId: bigint, reason: string, userId: bigint) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment || payment.status !== 'SUCCESS')
      throw new BadRequestException('Payment is not eligible for refund');

    if (payment.booking.userId !== userId)
      throw new UnauthorizedException("Cannot refund another user's payment");

    // BE-055 fix: Check if refund already REQUESTED
    const existingRefund = await this.prisma.refund.findFirst({
      where: { paymentId, status: 'REQUESTED' },
    });
    if (existingRefund) {
      throw new BadRequestException('A refund request already exists for this payment');
    }

    return this.prisma.refund.create({
      data: {
        paymentId,
        amount: payment.amount,
        reason,
        status: 'REQUESTED',
      },
    });
  }
}
