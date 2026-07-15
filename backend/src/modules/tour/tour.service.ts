import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TourService {
  constructor(private prisma: PrismaService) {}

  async getTours(
    region?: string,
    type?: string,
    page: number = 1,
    limit: number = 10,
    minRating?: number,
    sortBy?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (region) {
      whereClause.destination = { region: region };
    }
    // Mapping type to DestinationType enum (VIETNAM or INTERNATIONAL)
    if (type === 'VIETNAM' || type === 'INTERNATIONAL') {
      whereClause.destination = { ...whereClause.destination, type: type };
    }

    if (minRating) {
      whereClause.ratingAvg = { gte: minRating };
    }

    let orderBy: any = {};
    if (sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { basePrice: 'desc' };
    else if (sortBy === 'rating_desc') orderBy = { ratingAvg: 'desc' };
    else orderBy = { id: 'desc' }; // default

    const [tours, total] = await Promise.all([
      this.prisma.tour.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: { images: true },
      }),
      this.prisma.tour.count({ where: whereClause }),
    ]);

    return {
      data: tours,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTour(id: bigint) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        images: true,
        itineraries: true,
      },
    });
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async getRelatedTours(id: bigint) {
    const tour = await this.prisma.tour.findUnique({ where: { id } });
    if (!tour) throw new NotFoundException('Tour not found');

    return this.prisma.tour.findMany({
      where: {
        id: { not: id },
        destinationId: tour.destinationId,
      },
      take: 4,
      include: { images: true },
    });
  }

  async getDestinations(tag?: string) {
    const destinations = await this.prisma.destination.findMany();
    if (tag) {
      return destinations.filter((d) => (d.tags as string[])?.includes(tag));
    }
    return destinations;
  }
}
