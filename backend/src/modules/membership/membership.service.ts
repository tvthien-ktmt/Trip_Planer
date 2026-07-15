import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async awardPoints(userId: bigint, bookingAmount: number, bookingId?: bigint) {
    // Basic logic: 1 point per 10,000 VND
    const pointsChange = Math.floor(bookingAmount / 10000);

    if (pointsChange <= 0) return;

    await this.prisma.$transaction(async (tx) => {
      // Create transaction
      await tx.pointTransaction.create({
        data: {
          userId,
          bookingId,
          pointsChange,
          reason: 'Booking completion',
        },
      });

      // Update balance
      const userPoints = await tx.userPoints.upsert({
        where: { userId },
        update: { pointsBalance: { increment: pointsChange } },
        create: { userId, pointsBalance: pointsChange },
      });

      // Check tier upgrade
      const tiers = await tx.membershipTier.findMany({
        orderBy: { minPoints: 'desc' },
      });
      let nextTier = null;
      for (const tier of tiers) {
        if (userPoints.pointsBalance >= tier.minPoints) {
          nextTier = tier;
          break;
        }
      }

      if (nextTier && userPoints.tierId !== nextTier.id) {
        await tx.userPoints.update({
          where: { userId },
          data: { tierId: nextTier.id },
        });

        // Trigger notification logic via event emitter or direct service call in real life
        console.log(`User ${userId} upgraded to tier ${nextTier.name}`);
      }
    });
  }
}
