import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    userId: bigint,
    reviewableType: 'TOUR' | 'FLIGHT',
    reviewableId: bigint,
    rating: number,
    comment?: string,
  ) {
    // 1. Enforce rule: User must have a COMPLETED booking for this item
    let hasCompletedBooking = false;

    if (reviewableType === 'TOUR') {
      const booking = await this.prisma.booking.findFirst({
        where: {
          userId,
          status: 'COMPLETED',
          type: 'TOUR',
          items: { some: { itemType: 'TOUR_SLOT', itemRefId: reviewableId } },
        },
      });
      hasCompletedBooking = !!booking;
    } else {
      const booking = await this.prisma.booking.findFirst({
        where: {
          userId,
          status: 'COMPLETED',
          type: 'FLIGHT',
        },
      });
      // In reality, map flight strictly, here we just check type
      hasCompletedBooking = !!booking;
    }

    if (!hasCompletedBooking) {
      throw new BadRequestException(
        'You can only review services you have completed',
      );
    }

    // 2. Prevent spam (1 user = 1 review per item)
    const existingReview = await this.prisma.review.findFirst({
      where: { userId, reviewableType, reviewableId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this item');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        reviewableType,
        reviewableId,
        rating,
        comment,
      },
    });

    // 3. Update ratingAvg incrementally
    if (reviewableType === 'TOUR') {
      const tour = await this.prisma.tour.findUnique({
        where: { id: reviewableId },
      });
      if (tour) {
        const oldCount = tour.reviewCount;
        const oldAvg = Number(tour.ratingAvg);
        const newAvg = (oldAvg * oldCount + rating) / (oldCount + 1);

        await this.prisma.tour.update({
          where: { id: reviewableId },
          data: {
            ratingAvg: newAvg,
            reviewCount: oldCount + 1,
          },
        });
      }
    }

    return review;
  }

  async upvoteReview(reviewId: bigint, userId: bigint) {
    // Ideally check if user already voted. We will just increment for demo.
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });
  }
}
