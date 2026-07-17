import { Controller, Get, Param, Query } from '@nestjs/common';
import { FlightService } from './flight.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

class SearchFlightsDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumberString()
  @IsNotEmpty()
  passengers: string;

  @IsString()
  @IsOptional()
  @IsIn(['price_asc', 'duration_asc', 'time_asc'])
  sortBy?: string;
}

@ApiTags('Flight')
@Controller('api/flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search flights' })
  async searchFlights(@Query() query: SearchFlightsDto) {
    return this.flightService.searchFlights(
      query.from,
      query.to,
      query.date,
      Number(query.passengers),
      query.sortBy,
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
