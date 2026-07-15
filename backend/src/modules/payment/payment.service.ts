import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async initiatePayment(bookingId: bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== 'DRAFT') {
      throw new BadRequestException('Invalid booking for payment');
    }

    // Mock VNPay URL generation
    const paymentUrl = `${this.configService.get('VNPAY_URL')}?vnp_TxnRef=${bookingId}&vnp_Amount=${Number(booking.totalAmount) * 100}`;

    // Create pending payment record with idempotency key
    const idempotencyKey = `PAY_VNPAY_${bookingId}_${Date.now()}`;
    await this.prisma.payment.create({
      data: {
        bookingId,
        method: 'VNPAY',
        amount: booking.totalAmount,
        status: 'PENDING',
        idempotencyKey,
      },
    });

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

    const secretKey = this.configService.get('VNPAY_HASH_SECRET') || 'secret';
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    // Secure comparison using timingSafeEqual to prevent timing attacks
    // FIX: Must check length first because timingSafeEqual throws RangeError on length mismatch
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

    // Transaction with Idempotency check
    await this.prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.findUnique({
        where: { bookingId },
      });

      if (!payment) throw new BadRequestException('Payment not found');

      // Idempotency: If already SUCCESS, just return
      if (payment.status === 'SUCCESS') {
        return { RspCode: '00', Message: 'Confirm Success' };
      }

      if (responseCode === '00') {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            transactionRef: vnpayParams['vnp_TransactionNo'],
          },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      } else {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
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
