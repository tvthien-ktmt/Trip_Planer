import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  VerifyEmailJob,
  BookingConfirmationJob,
  InvoiceJob,
  RefundResultJob,
  PasswordResetJob,
} from '../modules/email/email.service';

/**
 * Email Queue Processor (BullMQ Worker)
 *
 * Handles all email jobs asynchronously.
 * In production: integrate with Nodemailer + SMTP (Ethereal/SendGrid/SES).
 * Currently: logs to console for development.
 *
 * Queue: 'email'
 * Jobs handled:
 *   - send-verify-email
 *   - send-booking-confirmation
 *   - send-invoice
 *   - send-refund-result
 *   - send-password-reset
 */
@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(
      `Processing email job: ${job.name} (attempt ${job.attemptsMade + 1})`,
    );

    switch (job.name) {
      case 'send-verify-email':
        return this.handleVerifyEmail(job.data as VerifyEmailJob);

      case 'send-booking-confirmation':
        return this.handleBookingConfirmation(
          job.data as BookingConfirmationJob,
        );

      case 'send-invoice':
        return this.handleInvoice(job.data as InvoiceJob);

      case 'send-refund-result':
        return this.handleRefundResult(job.data as RefundResultJob);

      case 'send-password-reset':
        return this.handlePasswordReset(job.data as PasswordResetJob);

      default:
        this.logger.warn(`Unknown email job type: ${job.name}`);
    }
  }

  // BE-030 fix: Helper to mask email address
  private maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) return '***@***';
    const name = parts[0];
    const domain = parts[1];
    return `${name.substring(0, 2)}***@${domain}`;
  }

  private async handleVerifyEmail(data: VerifyEmailJob): Promise<void> {
    // In production: use Nodemailer with SMTP
    
    // BE-030 fix: Mask PII in logs
    this.logger.log(`📧 [VERIFY EMAIL] → ${this.maskEmail(data.to)}`);
    this.logger.log(`   Subject: Xác thực email tài khoản Trip Planner`);
    this.logger.log(
      `   Template: Chào [USER], mã OTP của bạn đã được gửi.`,
    );
  }

  private async handleBookingConfirmation(
    data: BookingConfirmationJob,
  ): Promise<void> {
    this.logger.log(`📧 [BOOKING CONFIRMATION] → ${this.maskEmail(data.to)}`);
    this.logger.log(`   Subject: Xác nhận đặt chỗ #${data.bookingCode}`);
    this.logger.log(
      `   Template: Chào [USER], đặt chỗ ${data.bookingCode} trị giá ` +
        `${data.totalAmount.toLocaleString('vi-VN')} ${data.currency} đã được xác nhận.`,
    );
  }

  private async handleInvoice(data: InvoiceJob): Promise<void> {
    this.logger.log(`📧 [INVOICE] → ${this.maskEmail(data.to)}`);
    this.logger.log(
      `   Subject: Hóa đơn thanh toán - Booking #${data.bookingCode}`,
    );
    this.logger.log(
      `   Template: Hóa đơn cho [USER] - ` +
        `${data.amount.toLocaleString('vi-VN')} ${data.currency} qua ${data.method} - ` +
        `Mã GD: ${data.paymentRef}`,
    );
  }

  private async handleRefundResult(data: RefundResultJob): Promise<void> {
    this.logger.log(`📧 [REFUND RESULT] → ${this.maskEmail(data.to)}`);
    this.logger.log(
      `   Subject: Kết quả hoàn tiền - Booking #${data.bookingCode}`,
    );

    if (data.status === 'APPROVED') {
      this.logger.log(
        `   Template: Chào [USER], yêu cầu hoàn tiền ` +
          `${data.amount.toLocaleString('vi-VN')} ${data.currency} đã được CHẤP THUẬN.`,
      );
    } else {
      this.logger.log(
        `   Template: Chào [USER], yêu cầu hoàn tiền đã bị TỪ CHỐI. ` +
          `Lý do: ${data.reason || 'Không có lý do'}`,
      );
    }
  }

  private async handlePasswordReset(data: PasswordResetJob): Promise<void> {
    // BE-030 fix: Mask PII in logs
    this.logger.log(`📧 [PASSWORD RESET] → ${this.maskEmail(data.to)}`);
    this.logger.log(`   Subject: Đặt lại mật khẩu Trip Planner`);
    this.logger.log(
      `   Template: Chào [USER], mã OTP đặt lại mật khẩu đã được gửi.`,
    );
  }
}
