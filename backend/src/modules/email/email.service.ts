import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export type EmailJobName =
  | 'send-verify-email'
  | 'send-booking-confirmation'
  | 'send-invoice'
  | 'send-refund-result'
  | 'send-password-reset'
  | 'send-contact-notification';

export interface VerifyEmailJob {
  to: string;
  fullName: string;
  otp: string;
}

export interface BookingConfirmationJob {
  to: string;
  fullName: string;
  bookingCode: string;
  bookingType: 'FLIGHT' | 'TOUR';
  totalAmount: number;
  currency: string;
  items?: Array<{ name: string; price: number }>;
}

export interface InvoiceJob {
  to: string;
  fullName: string;
  bookingCode: string;
  paymentRef: string;
  amount: number;
  currency: string;
  method: string;
  paidAt: Date;
}

export interface RefundResultJob {
  to: string;
  fullName: string;
  bookingCode: string;
  amount: number;
  currency: string;
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
}

export interface PasswordResetJob {
  to: string;
  fullName: string;
  otp: string;
}

/**
 * Email Service — enqueues email jobs into BullMQ.
 *
 * Actual sending is done by EmailProcessor (the worker).
 * This pattern ensures email failures don't break the main flow
 * and supports retries automatically via BullMQ.
 */
@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendVerifyEmail(data: VerifyEmailJob): Promise<void> {
    await this.emailQueue.add('send-verify-email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }

  async sendBookingConfirmation(data: BookingConfirmationJob): Promise<void> {
    await this.emailQueue.add('send-booking-confirmation', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
    });
  }

  async sendInvoice(data: InvoiceJob): Promise<void> {
    await this.emailQueue.add('send-invoice', data, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 10000 },
      removeOnComplete: 200,
    });
  }

  async sendRefundResult(data: RefundResultJob): Promise<void> {
    await this.emailQueue.add('send-refund-result', data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 100,
    });
  }

  async sendPasswordReset(data: PasswordResetJob): Promise<void> {
    await this.emailQueue.add('send-password-reset', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 50,
    });
  }

  // R6-BE-002 fix: Contact form notification email
  async sendContactNotification(data: { to: string; fromName: string; fromEmail: string; subject: string; message: string }): Promise<void> {
    await this.emailQueue.add('send-contact-notification', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
    });
  }
}
