import { Controller, Get, Param, Query } from '@nestjs/common';
import { FlightService } from './flight.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Flight')
@Controller('api/flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search flights' })
  @ApiQuery({
    name: 'from',
    required: true,
    description: 'Departure Airport ID',
  })
  @ApiQuery({ name: 'to', required: true, description: 'Arrival Airport ID' })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'passengers', required: true })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price_asc', 'duration_asc', 'time_asc'],
  })
  async searchFlights(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('date') date: string,
    @Query('passengers') passengers: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.flightService.searchFlights(
      from,
      to,
      date,
      Number(passengers),
      sortBy,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight detail' })
  async getFlight(@Param('id') id: string) {
    return this.flightService.getFlight(BigInt(id));
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get flight seats' })
  async getFlightSeats(@Param('id') id: string) {
    return this.flightService.getFlightSeats(BigInt(id));
  }
}
