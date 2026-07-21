import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { FlightService } from './flight.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

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
  constructor(
    private readonly flightService: FlightService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  @Get('ancillary/options')
  @ApiOperation({ summary: 'Get ancillary service options (baggage, meal, addons)' })
  async getAncillaryOptions() {
    // Check cache first
    const cacheKey = 'ancillary_options';
    const cached = await this.cacheManager.get(cacheKey).catch(() => null);
    if (cached) return cached;

    // Try to load from SystemSetting key 'ANCILLARY_OPTIONS'
    const setting = await this.prisma.extended.systemSetting.findUnique({
      where: { settingKey: 'ANCILLARY_OPTIONS' },
    }).catch(() => null);

    let options: any;
    if (setting?.settingValue) {
      try { options = JSON.parse(setting.settingValue as string); } catch { /* ignore */ }
    }

    if (!options) {
      // Static catalog fallback (single source of truth — not mock)
      options = {
        baggage: [
          { id: 'bag-0', weight: 0, price: 0, label: 'Không mua thêm' },
          { id: 'bag-10', weight: 10, price: 300000, label: 'Thêm 10kg' },
          { id: 'bag-20', weight: 20, price: 500000, label: 'Thêm 20kg' },
          { id: 'bag-30', weight: 30, price: 700000, label: 'Thêm 30kg' },
        ],
        meals: [
          { id: 'm1', name: 'Mì xào hải sản', price: 150000, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80' },
          { id: 'm2', name: 'Cơm gà quay', price: 150000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80' },
          { id: 'm3', name: 'Bánh mì thịt', price: 80000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=300&q=80' },
        ],
        addons: [
          { id: 'insurance', title: 'Bảo hiểm trễ chuyến', desc: 'Bồi thường lên đến 2.000.000đ khi chuyến bay trễ trên 2 giờ.', price: 150000, icon: 'shield' },
          { id: 'wifi', title: 'Wi-Fi trên chuyến bay', desc: 'Lướt web tốc độ cao không giới hạn trong suốt chuyến bay.', price: 200000, icon: 'wifi' },
          { id: 'transfer', title: 'Đưa đón sân bay', desc: 'Xe riêng đón tận nơi từ sân bay về trung tâm thành phố.', price: 350000, icon: 'car' },
        ],
      };
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, options, 300).catch(() => null);
    return options;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight detail' })
  async getFlight(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.flightService.getFlight(id);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get flight seats' })
  async getFlightSeats(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.flightService.getFlightSeats(id);
  }

  @Get('status/:flightNo')
  @ApiOperation({ summary: 'Get flight status by flight number' })
  async getFlightStatus(@Param('flightNo') flightNo: string) {
    return this.flightService.getFlightStatus(flightNo);
  }
}
