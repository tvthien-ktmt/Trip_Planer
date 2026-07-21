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

    const flights = await this.prisma.extended.flight.findMany({
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
          ...a.fareClasses.map((fc: any) => fc.basePrice.toNumber()),
        );
        const minB = Math.min(
          ...b.fareClasses.map((fc: any) => fc.basePrice.toNumber()),
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
    const flight = await this.prisma.extended.flight.findUnique({
      where: { id },
      include: { fareClasses: true },
    });
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  async getFlightSeats(id: bigint) {
    return this.prisma.extended.flightSeat.findMany({
      where: { flightId: id },
    });
  }

  async getFlightStatus(flightNo: string) {
    // Find today's/upcoming flight with this number
    const today = new Date();
    today.setHours(0,0,0,0);
    const flight = await this.prisma.extended.flight.findFirst({
      where: {
        flightNumber: flightNo.toUpperCase(),
        departureTime: {
          gte: today
        }
      },
      orderBy: {
        departureTime: 'asc'
      },
      include: {
        departureAirport: true,
        arrivalAirport: true
      }
    });

    if (!flight) throw new NotFoundException('Flight not found');

    return {
      id: flight.flightNumber,
      status: flight.status === 'SCHEDULED' ? 'On Time' : flight.status,
      from: flight.departureAirport.iataCode,
      to: flight.arrivalAirport.iataCode,
      date: flight.departureTime.toLocaleDateString('vi-VN'),
      departure: flight.departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      arrival: flight.arrivalTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      gate: 'TBA'
    };
  }
}
