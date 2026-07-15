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

@ApiTags('Payment')
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':bookingId/initiate')
  @ApiOperation({ summary: 'Initiate VNPay payment' })
  async initiatePayment(@Param('bookingId') bookingId: string) {
    return this.paymentService.initiatePayment(BigInt(bookingId));
  }

  // Webhook VNPay callback - no AuthGuard required
  @Get('vnpay/callback')
  @ApiOperation({ summary: 'VNPay Webhook Callback' })
  async vnpayCallback(@Query() vnpayParams: any) {
    return this.paymentService.vnpayCallback(vnpayParams);
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
