import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        dateOfBirth: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: bigint, data: any) {
    // In reality, upload avatar to S3 or similar, here we just save the URL
    if (data.avatarUrl) {
      // Validate or resize logic (placeholder for actual implementation)
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        nationalId: data.nationalId,
        passportNo: data.passportNo,
      },
    });
  }
}
