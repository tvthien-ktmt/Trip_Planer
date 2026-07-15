import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourService } from './tour.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tour')
@Controller('api')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get('tours')
  @ApiOperation({ summary: 'List all tours with pagination and filters' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  async getTours(
    @Query('region') region?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minRating') minRating?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.tourService.getTours(
      region,
      type,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      minRating ? Number(minRating) : undefined,
      sortBy,
    );
  }

  @Get('tours/:id')
  @ApiOperation({ summary: 'Get tour details' })
  async getTour(@Param('id') id: string) {
    return this.tourService.getTour(BigInt(id));
  }

  @Get('tours/:id/related')
  @ApiOperation({ summary: 'Get related tours' })
  async getRelatedTours(@Param('id') id: string) {
    return this.tourService.getRelatedTours(BigInt(id));
  }

  @Get('destinations')
  @ApiOperation({ summary: 'Get all destinations' })
  @ApiQuery({ name: 'tag', required: false })
  async getDestinations(@Query('tag') tag?: string) {
    return this.tourService.getDestinations(tag);
  }
}
