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
      // BE-031 fix: Map flight strictly
      const booking = await this.prisma.booking.findFirst({
        where: {
          userId,
          status: 'COMPLETED',
          type: 'FLIGHT',
          passengers: {
            some: {
              seat: { flightId: reviewableId }
            }
          }
        },
      });
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
    // BE-032 fix: Prevent same user from upvoting multiple times
    // Check if this user already has an active upvote recorded
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Use a simple string-based tracking approach: store user IDs in a JSON field
    // If schema doesn't have ReviewVote table, we leverage uniqueVoters field
    // Check existing voters list (stored as serialized JSON in comment or use a Prisma raw query)
    // Since schema has no ReviewVote table, we prevent double-upvote by checking if userId is already noted
    // Practical approach: Use the existing Prisma schema and a separate tracking record
    // For now, we'll use a raw approach - track upvoters with a dedicated unique check
    
    // Check if user already upvoted (via BookingItem or via direct check on a field we control)
    // As a pragmatic fix without schema change: use Redis-style cache key check
    // Since we don't have Redis access here, use a database lookup via ActivityLog as indicator
    const existingVote = await this.prisma.activityLog.findFirst({
      where: {
        userId,
        action: `REVIEW_UPVOTE_${reviewId.toString()}`,
      },
    });

    if (existingVote) {
      throw new BadRequestException('You have already upvoted this review');
    }

    // Record the upvote in activity log to prevent duplicates
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: `REVIEW_UPVOTE_${reviewId.toString()}`,
        description: `Upvoted review #${reviewId.toString()}`,
      },
    });

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });
  }
}
