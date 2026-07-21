import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Body,
  Headers,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import type { Request } from 'express';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

class VnPayCallbackDto {
  @IsString()
  @IsNotEmpty()
  vnp_TmnCode: string;

  @IsString()
  @IsNotEmpty()
  vnp_TxnRef: string;

  @IsString()
  @IsNotEmpty()
  vnp_SecureHash: string;

  @IsString()
  @IsOptional()
  vnp_Amount?: string;

  @IsString()
  @IsOptional()
  vnp_BankCode?: string;

  @IsString()
  @IsOptional()
  vnp_BankTranNo?: string;

  @IsString()
  @IsOptional()
  vnp_CardType?: string;

  @IsString()
  @IsOptional()
  vnp_OrderInfo?: string;

  @IsString()
  @IsOptional()
  vnp_PayDate?: string;

  @IsString()
  @IsOptional()
  vnp_ResponseCode?: string;

  @IsString()
  @IsOptional()
  vnp_TransactionNo?: string;

  @IsString()
  @IsOptional()
  vnp_TransactionStatus?: string;
}

@ApiTags('Payment')
@Controller('api/payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':bookingId/initiate')
  @ApiOperation({ summary: 'Initiate VNPay payment' })
  async initiatePayment(
    @Param('bookingId', ParseBigIntPipe) bookingId: bigint,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.initiatePayment(bookingId, user.id);
  }

  // Webhook VNPay callback - no AuthGuard required
  @Get('vnpay/callback')
  @ApiOperation({ summary: 'VNPay Webhook Callback' })
  async vnpayCallback(@Req() req: Request, @Query() vnpayParams: VnPayCallbackDto) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // In production, verify against VNPay IP whitelist if needed
    return this.paymentService.vnpayCallback(vnpayParams, ip as string);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':bookingId/initiate-sepay')
  @ApiOperation({ summary: 'Initiate SePay payment' })
  async initiateSepay(
    @Param('bookingId', ParseBigIntPipe) bookingId: bigint,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.initiateSepay(bookingId, user.id);
  }

  @Get('status/:paymentId')
  @ApiOperation({ summary: 'Get payment status (polling)' })
  async getPaymentStatus(@Param('paymentId', ParseBigIntPipe) paymentId: bigint) {
    return this.paymentService.getPaymentStatus(paymentId);
  }

  @Post('sepay/webhook')
  @ApiOperation({ summary: 'SePay Webhook Callback' })
  async sepayWebhook(
    @Headers('x-sepay-signature') sig: string,
    @Body() payload: any,
  ) {
    // R5-BE-002 fix: HMAC-SHA256 verification for SePay webhook
    const secret = this.configService.get('SEPAY_WEBHOOK_SECRET');
    if (secret) {
      const rawBody = JSON.stringify(payload);
      const computed = createHmac('sha256', secret).update(rawBody).digest('hex');
      if (
        !sig ||
        Buffer.byteLength(sig) !== Buffer.byteLength(computed) ||
        !timingSafeEqual(Buffer.from(sig), Buffer.from(computed))
      ) {
        throw new UnauthorizedException('Invalid SePay signature');
      }
    }
    return this.paymentService.sepayWebhook(payload);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':paymentId/refund')
  @ApiOperation({ summary: 'Request a refund' })
  async requestRefund(
    @Param('paymentId', ParseBigIntPipe) paymentId: bigint,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.requestRefund(
      paymentId,
      reason,
      user.id,
    );
  }
}
