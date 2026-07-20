import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async toggleWishlist(
    userId: bigint,
    itemType: 'TOUR' | 'DESTINATION' | 'WONDER',
    itemId: bigint,
  ) {
    const existing = await this.prisma.extended.wishlist.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
    });

    if (existing) {
      // Toggle off
      await this.prisma.extended.wishlist.delete({ where: { id: existing.id } });
      return { success: true, action: 'removed' };
    } else {
      // Toggle on
      await this.prisma.extended.wishlist.create({
        data: { userId, itemType, itemId },
      });
      return { success: true, action: 'added' };
    }
  }

  async getWishlist(userId: bigint) {
    return this.prisma.extended.wishlist.findMany({ where: { userId } });
  }
}
