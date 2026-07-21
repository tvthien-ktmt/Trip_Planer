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

  private transporter: any;

  constructor() {
    super();
    // Use nodemailer require to avoid TS compile issues if types are missing
    const nodemailer = require('nodemailer');
    
    // R5-BE-001 fix: Real SMTP integration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'etherealpass',
      },
    });
  }

  // BE-030 fix: Helper to mask email address
  private maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) return '***@***';
    const name = parts[0];
    const domain = parts[1];
    return `${name.substring(0, 2)}***@${domain}`;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      if (process.env.NODE_ENV !== 'test') {
        const fromAddress = process.env.SMTP_FROM || '"Trip Planner" <noreply@tripplanner.com>';
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });
        this.logger.log(`📧 Email sent to ${this.maskEmail(to)}: ${info.messageId}`);
      } else {
        this.logger.debug(`[TEST] Email would be sent to ${this.maskEmail(to)}: ${subject}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${this.maskEmail(to)}:`, error);
      throw error; // Rethrow so BullMQ can retry
    }
  }

  private async handleVerifyEmail(data: VerifyEmailJob): Promise<void> {
    this.logger.log(`📧 [VERIFY EMAIL] Preparing for ${this.maskEmail(data.to)}`);
    const subject = `Xác thực email tài khoản Trip Planner`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Xác thực tài khoản Trip Planner</h1>
        <p>Chào ${data.fullName || 'bạn'},</p>
        <p>Mã OTP xác thực email của bạn là:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${data.otp}</span>
        </div>
        <p style="color: #6b7280;">Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.</p>
      </div>
    `;
    await this.sendEmail(data.to, subject, html);
  }

  private async handleBookingConfirmation(
    data: BookingConfirmationJob,
  ): Promise<void> {
    this.logger.log(`📧 [BOOKING CONFIRMATION] Preparing for ${this.maskEmail(data.to)}`);
    const subject = `Xác nhận đặt chỗ #${data.bookingCode}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a;">✈ Đặt vé thành công!</h1>
        <p>Chào bạn,</p>
        <p>Đặt chỗ của bạn đã được xác nhận:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Mã đặt chỗ</td><td style="padding: 8px;">${data.bookingCode}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Tổng tiền</td><td style="padding: 8px; color: #dc2626;">${data.totalAmount.toLocaleString('vi-VN')} ${data.currency}</td></tr>
        </table>
        <p style="color: #6b7280;">Cảm ơn bạn đã sử dụng dịch vụ của Trip Planner!</p>
      </div>
    `;
    await this.sendEmail(data.to, subject, html);
  }

  private async handleInvoice(data: InvoiceJob): Promise<void> {
    this.logger.log(`📧 [INVOICE] Preparing for ${this.maskEmail(data.to)}`);
    const subject = `Hóa đơn thanh toán - Booking #${data.bookingCode}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Hóa đơn thanh toán</h1>
        <p>Cảm ơn bạn đã thanh toán thành công!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Mã đặt chỗ</td><td style="padding: 8px;">${data.bookingCode}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Số tiền</td><td style="padding: 8px; color: #dc2626;">${data.amount.toLocaleString('vi-VN')} ${data.currency}</td></tr>
          <tr><td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Phương thức</td><td style="padding: 8px;">${data.method}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Mã giao dịch</td><td style="padding: 8px;">${data.paymentRef}</td></tr>
        </table>
      </div>
    `;
    await this.sendEmail(data.to, subject, html);
  }

  private async handleRefundResult(data: RefundResultJob): Promise<void> {
    this.logger.log(`📧 [REFUND RESULT] Preparing for ${this.maskEmail(data.to)}`);
    const subject = `Kết quả hoàn tiền - Booking #${data.bookingCode}`;
    let text = '';

    if (data.status === 'APPROVED') {
      text = `Chào bạn, yêu cầu hoàn tiền ${data.amount.toLocaleString('vi-VN')} ${data.currency} đã được CHẤP THUẬN.`;
    } else {
      text = `Chào bạn, yêu cầu hoàn tiền đã bị TỪ CHỐI. Lý do: ${data.reason || 'Không có lý do'}`;
    }
    await this.sendEmail(data.to, subject, text);
  }

  private async handlePasswordReset(data: PasswordResetJob): Promise<void> {
    this.logger.log(`📧 [PASSWORD RESET] Preparing for ${this.maskEmail(data.to)}`);
    const subject = `Đặt lại mật khẩu Trip Planner`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Đặt lại mật khẩu</h1>
        <p>Chào ${data.fullName || 'bạn'},</p>
        <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">${data.otp}</span>
        </div>
        <p style="color: #6b7280;">Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
        <p style="color: #6b7280;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
      </div>
    `;
    await this.sendEmail(data.to, subject, html);
  }
}
