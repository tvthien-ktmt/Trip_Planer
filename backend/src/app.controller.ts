import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './modules/email/email.service';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

class ContactDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;

  @IsString()
  subject?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/contact')
  async submitContact(@Body() dto: ContactDto) {
    // R6-BE-002 fix: Real implementation — DB write + email notification
    // OLD: Returns {success:true} without ANY side effects (complete mock)
    // NEW: Writes to DB (ActivityLog) + enqueues admin notification email

    if (!dto.fullName || !dto.email || !dto.message) {
      throw new BadRequestException('Vui lòng điền đầy đủ thông tin');
    }

    // 1. Persist to ContactSubmission DB table (exists in Prisma schema)
    try {
      await this.prisma.extended.contactSubmission.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          subject: dto.subject || 'Liên hệ từ website',
          message: dto.message,
          status: 'NEW',
        },
      });
    } catch (dbError) {
      // Log error but don't fail the request — still send email
      console.error('Failed to persist contact message to DB:', dbError);
    }

    // 2. Send notification email to admin (uses SMTP queue)
    const adminEmail = process.env.SMTP_FROM || process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await this.emailService.sendContactNotification({
        to: adminEmail,
        fromName: dto.fullName,
        fromEmail: dto.email,
        subject: dto.subject || 'Liên hệ từ website',
        message: dto.message,
      });
    }

    return {
      success: true,
      message: 'Tin nhắn của bạn đã được gửi. Chúng tôi sẽ liên hệ lại sớm nhất!'
    };
  }
}
