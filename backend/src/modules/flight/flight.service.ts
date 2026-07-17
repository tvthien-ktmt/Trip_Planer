import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class FlightService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchFlights(
    from: string,
    to: string,
    date: string,
    passengers: number,
    sortBy: string = 'price_asc',
  ) {
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${from}_${to}_${date}_${passengers}_${sortBy}`)
      .digest('hex');
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const flights = await this.prisma.flight.findMany({
      where: {
        departureAirportId: BigInt(from), // In reality, from should be iataCode and resolved to ID
        arrivalAirportId: BigInt(to),
        departureTime: {
          gte: searchDate,
          lt: nextDate,
        },
      },
      include: {
        fareClasses: {
          where: {
            availableSeats: { gte: passengers },
          },
        },
      },
    });

    // Remove flights that have no available fare classes for the requested passengers
    const validFlights = flights.filter((f: any) => f.fareClasses.length > 0);

    // Sorting logic
    const sortedFlights = validFlights.sort((a: any, b: any) => {
      if (sortBy === 'price_asc') {
        const minA = Math.min(
          ...a.fareClasses.map((fc: any) => Number(fc.basePrice)),
        );
        const minB = Math.min(
          ...b.fareClasses.map((fc: any) => Number(fc.basePrice)),
        );
        return minA - minB;
      }
      if (sortBy === 'duration_asc') {
        const durA = a.arrivalTime.getTime() - a.departureTime.getTime();
        const durB = b.arrivalTime.getTime() - b.departureTime.getTime();
        return durA - durB;
      }
      if (sortBy === 'time_asc') {
        return a.departureTime.getTime() - b.departureTime.getTime();
      }
      return 0;
    });

    await this.cacheManager.set(cacheKey, sortedFlights, 60); // cache for 60s
    return sortedFlights;
  }

  async getFlight(id: bigint) {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
      include: { fareClasses: true },
    });
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  async getFlightSeats(id: bigint) {
    return this.prisma.flightSeat.findMany({
      where: { flightId: id },
    });
  }
}
