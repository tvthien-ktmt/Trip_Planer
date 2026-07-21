import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourService } from './tour.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { DestinationType } from '@prisma/client';

class GetToursDto {
  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  @IsIn([DestinationType.INTERNATIONAL, DestinationType.VIETNAM])
  type?: string;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;

  @IsNumberString()
  @IsOptional()
  minRating?: string;

  @IsString()
  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'rating_desc'])
  sortBy?: string;
}

@ApiTags('Tour')
@Controller('api')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get('tours')
  @ApiOperation({ summary: 'List all tours with pagination and filters' })
  async getTours(@Query() query: GetToursDto) {
    return this.tourService.getTours(
      query.region,
      query.type,
      query.page ? Number(query.page) : 1,
      query.limit ? Number(query.limit) : 10,
      query.minRating ? Number(query.minRating) : undefined,
      query.sortBy,
    );
  }

  @Get('tours/:id')
  @ApiOperation({ summary: 'Get tour details' })
  async getTour(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.tourService.getTour(id);
  }

  @Get('tours/:id/related')
  @ApiOperation({ summary: 'Get related tours' })
  async getRelatedTours(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.tourService.getRelatedTours(id);
  }

  @Get('destinations')
  @ApiOperation({ summary: 'Get all destinations' })
  @ApiQuery({ name: 'tag', required: false })
  async getDestinations(@Query('tag') tag?: string) {
    return this.tourService.getDestinations(tag);
  }
}
