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
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // 1. Enforce rule: User must have a COMPLETED booking for this item
    let hasCompletedBooking = false;

    if (reviewableType === 'TOUR') {
      const booking = await this.prisma.extended.booking.findFirst({
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
      const booking = await this.prisma.extended.booking.findFirst({
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
    const existingReview = await this.prisma.extended.review.findFirst({
      where: { userId, reviewableType, reviewableId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this item');
    }

    const review = await this.prisma.extended.review.create({
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
      const tour = await this.prisma.extended.tour.findUnique({
        where: { id: reviewableId },
      });
      if (tour) {
        const oldCount = tour.reviewCount;
        const oldAvg = Number(tour.ratingAvg);
        const newAvg = (oldAvg * oldCount + rating) / (oldCount + 1);

        await this.prisma.extended.tour.update({
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
    const review = await this.prisma.extended.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.extended.$transaction(async (tx) => {
      const existingVote = await tx.reviewVote.findFirst({
        where: {
          userId,
          reviewId,
        },
      });

      if (existingVote) {
        throw new BadRequestException('You have already upvoted this review');
      }

      await tx.reviewVote.create({
        data: {
          userId,
          reviewId,
          isUpvote: true,
        },
      });

      return tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
    }, { isolationLevel: 'Serializable' });
  }
}
