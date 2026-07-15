import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue, // Placeholder for BullMQ queue
  ) {}

  async sendNotification(
    userId: bigint | null,
    type: 'SYSTEM' | 'PROMOTION' | 'BOOKING_UPDATE',
    title: string,
    body: string,
  ) {
    if (userId === null) {
      // Broadcast logic, save one generic record or save N records.
      // Here we just save one generic record that frontend queries if they want global announcements
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
    // Enqueue to BullMQ for async dispatch
    await this.emailQueue.add('send-email', { toEmail, templateCode, payload });
  }
}
