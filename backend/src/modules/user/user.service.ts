import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: bigint) {
    const user = await this.prisma.extended.user.findUnique({
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

    return this.prisma.extended.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        nationalId: data.nationalId,
        passportNo: data.passportNo,
      },
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
  }

  async getUserStats(userId: bigint) {
    const [totalBookings, upcomingFlights, pointData, unreadNotifications] = await Promise.all([
      this.prisma.extended.booking.count({ where: { userId } }),
      this.prisma.extended.booking.count({
        where: {
          userId,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      }),
      this.prisma.extended.userPoints
        .findUnique({ where: { userId } })
        .catch(() => null),
      this.prisma.extended.notification.count({
        where: { userId, readAt: null },
      }).catch(() => 0),
    ]);

    return {
      totalBookings,
      upcomingFlights,
      points: Number(pointData?.pointsBalance ?? 0),
      unreadNotifications,
    };
  }

  async getUserMembership(userId: bigint) {
    const userPoints = await this.prisma.extended.userPoints.findUnique({
      where: { userId },
      include: { tier: true },
    }).catch(() => null);

    const user = await this.prisma.extended.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    }).catch(() => null);

    // Format card number from userId
    const cardNumber = userId.toString().padStart(16, '0').replace(/(\d{4})/g, '$1 ').trim();

    return {
      tier: userPoints?.tier || { name: 'SILVER', minPoints: 3000 },
      pointsBalance: Number(userPoints?.pointsBalance ?? 0),
      currentPoints: Number(userPoints?.pointsBalance ?? 0),
      cardNumber: `****-****-${cardNumber.slice(-8, -4)}-${cardNumber.slice(-4)}`,
      user: user ? { fullName: user.fullName } : null,
    };
  }

  async getUserPoints(userId: bigint) {
    const transactions = await this.prisma.extended.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }).catch(() => []);

    return transactions.map((t: any) => ({
      id: t.id?.toString(),
      userId: t.userId?.toString(),
      points: t.pointsChange,
      description: t.reason || 'Giao dịch điểm',
      createdAt: t.createdAt,
    }));
  }
}
