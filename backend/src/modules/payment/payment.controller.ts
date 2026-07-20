import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { Req } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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

  // Add signature bypass for other dynamic fields by not locking it down entirely
  // since VNPay sends many dynamic fields
}

@ApiTags('Payment')
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':bookingId/initiate')
  @ApiOperation({ summary: 'Initiate VNPay payment' })
  async initiatePayment(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.initiatePayment(BigInt(bookingId), user.id);
  }

  // Webhook VNPay callback - no AuthGuard required
  @Get('vnpay/callback')
  @ApiOperation({ summary: 'VNPay Webhook Callback' })
  async vnpayCallback(@Req() req: Request, @Query() vnpayParams: VnPayCallbackDto) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // In production, verify against VNPay IP whitelist if needed
    return this.paymentService.vnpayCallback(vnpayParams as any, ip as string);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':bookingId/initiate-sepay')
  @ApiOperation({ summary: 'Initiate SePay payment' })
  async initiateSepay(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.initiateSepay(BigInt(bookingId), user.id);
  }

  @Get('status/:paymentId')
  @ApiOperation({ summary: 'Get payment status (polling)' })
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentStatus(BigInt(paymentId));
  }

  @Post('sepay/webhook')
  @ApiOperation({ summary: 'SePay Webhook Callback' })
  async sepayWebhook(@Body() payload: any) {
    return this.paymentService.sepayWebhook(payload);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':paymentId/refund')
  @ApiOperation({ summary: 'Request a refund' })
  async requestRefund(
    @Param('paymentId') paymentId: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.requestRefund(
      BigInt(paymentId),
      reason,
      user.id,
    );
  }
}
