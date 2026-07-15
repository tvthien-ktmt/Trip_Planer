import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Review')
@Controller('api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  async createReview(
    @CurrentUser() user: any,
    @Body('reviewableType') reviewableType: 'TOUR' | 'FLIGHT',
    @Body('reviewableId') reviewableId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    return this.reviewService.createReview(
      user.id,
      reviewableType,
      BigInt(reviewableId),
      rating,
      comment,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/upvote')
  @ApiOperation({ summary: 'Upvote a review' })
  async upvoteReview(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewService.upvoteReview(BigInt(id), user.id);
  }
}
