import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// BE-061 fix: Map template codes to actual job names that EmailProcessor handles
const TEMPLATE_TO_JOB: Record<string, string> = {
  'VERIFY_EMAIL': 'send-verify-email',
  'BOOKING_CONFIRMATION': 'send-booking-confirmation',
  'INVOICE': 'send-invoice',
  'REFUND_RESULT': 'send-refund-result',
  'PASSWORD_RESET': 'send-password-reset',
};

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendNotification(
    userId: bigint | null,
    type: 'SYSTEM' | 'PROMOTION' | 'BOOKING_UPDATE',
    title: string,
    body: string,
  ) {
    if (userId === null) {
      return this.prisma.notification.create({
        data: { title, body, type },
      });
    }

    return this.prisma.notification.create({
      data: { userId, title, body, type },
    });
  }

  async dispatchEmailTemplate(
    toEmail: string,
    templateCode: string,
    payload: any,
  ) {
    // BE-061 fix: Map templateCode to actual job name that EmailProcessor handles
    const jobName = TEMPLATE_TO_JOB[templateCode];
    if (!jobName) {
      console.warn(`[NotificationService] Unknown template code: ${templateCode}. Skipping email dispatch.`);
      return;
    }
    await this.emailQueue.add(jobName, { to: toEmail, ...payload });
  }
}
