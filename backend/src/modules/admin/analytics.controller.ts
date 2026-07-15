import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Admin Analytics')
@Controller('api/admin/analytics')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpi')
  @ApiOperation({
    summary: 'Dashboard KPI summary (total revenue, bookings, users, refunds)',
  })
  async getKpi() {
    return this.analyticsService.getKpiSummary();
  }

  @Get('revenue')
  @Permissions('ANALYTICS_VIEW')
  @ApiOperation({ summary: 'Revenue analytics with trend data' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  async getRevenue(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getRevenue(period);
  }

  @Get('bookings')
  @Permissions('ANALYTICS_VIEW')
  @ApiOperation({
    summary: 'Booking analytics — count by status, type, and time trend',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  async getBookings(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getBookings(period);
  }

  @Get('users')
  @Permissions('ANALYTICS_VIEW')
  @ApiOperation({ summary: 'User growth analytics' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  async getUsers(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getUsers(period);
  }

  @Get('top-routes')
  @Permissions('ANALYTICS_VIEW')
  @ApiOperation({ summary: 'Top flight routes by booking count' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopRoutes(@Query('limit') limit?: number) {
    return this.analyticsService.getTopRoutes(Number(limit) || 10);
  }

  @Get('refunds')
  @Permissions('ANALYTICS_VIEW')
  @ApiOperation({ summary: 'Refund analytics — count and amount by status' })
  async getRefunds() {
    return this.analyticsService.getRefunds();
  }

  @Get('membership')
  @Permissions('ANALYTICS_VIEW')
  @ApiOperation({ summary: 'Membership tier distribution analytics' })
  async getMembership() {
    return this.analyticsService.getMembership();
  }
}
