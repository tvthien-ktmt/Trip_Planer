import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewableType } from '@prisma/client';

class CreateReviewDto {
  @IsEnum(ReviewableType)
  @IsNotEmpty()
  reviewableType: ReviewableType;

  @IsString()
  @IsNotEmpty()
  reviewableId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

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
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(
      user.id,
      dto.reviewableType,
      BigInt(dto.reviewableId),
      dto.rating,
      dto.comment,
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
