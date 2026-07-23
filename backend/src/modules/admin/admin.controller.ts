import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingService } from '../booking/booking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

class UpdateBookingStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles('ADMIN')
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
  ) {}

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  async getBookings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 20, 200);
    const skip = (pageNum - 1) * limitNum;

    const [total, data] = await Promise.all([
      this.prisma.extended.booking.count(),
      this.prisma.extended.booking.findMany({
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              role: true,
              status: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Admin: Update booking status via state machine' })
  async updateBookingStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: any,
  ) {
    // BE-042 fix: Use BookingService state machine, not hardcoded 'CONFIRMED'
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: id },
    });
    if (!booking) throw new BadRequestException('Booking not found');

    if (!this.bookingService.canTransition(booking.status, dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${dto.status}`,
      );
    }

    // BE-037: Admin `updateBookingStatus` use service method to ensure history & points
    await this.bookingService.updateBookingStatus(id, dto.status, user.id);

    return { success: true, status: dto.status };
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get booking details' })
  async getBookingDetail(@Param('id', ParseBigIntPipe) id: bigint) {
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: id },
      include: {
        user: true,
        items: true,
        passengers: true,
        payment: true,
      },
    });
    if (!booking) throw new BadRequestException('Booking not found');
    return { data: booking };
  }

  // --- USERS ---
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers() {
    const users = await this.prisma.extended.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: users };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details by ID' })
  async getUserDetail(@Param('id', ParseBigIntPipe) id: bigint) {
    const user = await this.prisma.extended.user.findUnique({
      where: { id: id },
    });
    if (!user) throw new BadRequestException('User not found');
    return { data: user };
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user profile/role' })
  async updateUser(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: any) {
    // BE-030 fix: Prevent field injection by explicitly selecting fields
    const { role, status, fullName, phone, dateOfBirth } = dto;
    
    // Additional validation could be done here if needed
    
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;

    const user = await this.prisma.extended.user.update({
      where: { id: id },
      data: updateData,
    });
    return { data: user };
  }

  @Patch('users/:id/lock')
  async lockUser(@Param('id', ParseBigIntPipe) id: bigint) {
    const user = await this.prisma.extended.user.findUnique({ where: { id: id } });
    const isCurrentlyActive = user?.status === 'ACTIVE';
    // R6-DB-007 fix: Must set lockReason='ADMIN_LOCK' when locking.
    // Without this, auto-unlock cron matches 'AUTO_FAILED_LOGIN:timestamp' and unlocks after 30 min,
    // bypassing the explicit admin lock.
    await this.prisma.extended.user.update({
      where: { id: id },
      data: {
        status: isCurrentlyActive ? 'LOCKED' : 'ACTIVE',
        lockReason: isCurrentlyActive ? 'ADMIN_LOCK' : null,
      },
    });
    return { success: true, status: isCurrentlyActive ? 'LOCKED' : 'ACTIVE' };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseBigIntPipe) id: bigint) {
    // BE-032 fix: Revoke tokens and sessions when deleting user
    await this.prisma.extended.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: id },
        data: { deletedAt: new Date() },
      });
      
      await tx.refreshToken.deleteMany({
        where: { userId: id },
      });
    });
    
    return { success: true };
  }

  @Patch('users/:id/restore')
  async restoreUser(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.prisma.extended.user.update({
      where: { id: id },
      data: { deletedAt: null },
    });
    return { success: true };
  }

  // --- FLIGHTS ---
  @Get('flights')
  async getFlights() {
    const flights = await this.prisma.extended.flight.findMany({
      orderBy: { departureTime: 'desc' },
    });
    return { data: flights };
  }

  @Get('flights/:id')
  async getFlightDetail(@Param('id', ParseBigIntPipe) id: bigint) {
    const flight = await this.prisma.extended.flight.findUnique({
      where: { id: id },
    });
    return { data: flight };
  }

  @Post('flights')
  async createFlight(@Body() dto: any) {
    const flight = await this.prisma.extended.flight.create({
      data: dto,
    });
    return { data: flight };
  }

  @Patch('flights/:id')
  async updateFlight(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: any) {
    const flight = await this.prisma.extended.flight.update({
      where: { id: id },
      data: dto,
    });
    return { data: flight };
  }

  @Delete('flights/:id')
  async deleteFlight(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.prisma.extended.flight.delete({
      where: { id: id },
    });
    return { success: true };
  }

  // --- TOURS ---
  @Get('tours')
  async getTours() {
    const tours = await this.prisma.extended.tour.findMany({
      orderBy: { id: 'desc' },
    });
    return { data: tours };
  }

  @Post('tours')
  async createTour(@Body() dto: any) {
    const tour = await this.prisma.extended.tour.create({
      data: dto,
    });
    return { data: tour };
  }

  @Delete('tours/:id')
  async deleteTour(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.prisma.extended.tour.delete({
      where: { id: id },
    });
    return { success: true };
  }

  // --- BLOGS ---
  @Get('blogs')
  async getBlogs() {
    const blogs = await this.prisma.extended.blogPost.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data: blogs };
  }

  @Delete('blogs/:id')
  async deleteBlog(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.prisma.extended.blogPost.delete({
      where: { id: id },
    });
    return { success: true };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View audit logs (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 50, 200); // cap at 200
    const skip = (pageNum - 1) * limitNum;

    const [total, data] = await Promise.all([
      this.prisma.extended.auditLog.count(),
      this.prisma.extended.auditLog.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          adminUser: {
            select: { id: true, email: true, fullName: true, role: true },
          },
        },
      }),
    ]);

    return {
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    };
  }

  // R6 Phase 1: Airports endpoint (FE AirportList.tsx was 100% mock)
  @Get('airports')
  @ApiOperation({ summary: 'Get all airports' })
  async getAirports(@Query('search') search?: string) {
    const where = search
      ? {
          OR: [
            { iataCode: { contains: search.toUpperCase() } },
            { name: { contains: search } },
            { city: { contains: search } },
            { country: { contains: search } },
          ],
        }
      : undefined;

    const airports = await this.prisma.extended.airport.findMany({
      where,
      orderBy: { iataCode: 'asc' },
    });
    return { data: airports, meta: { total: airports.length } };
  }

  // R6 Phase 1: Payments list endpoint (FE PaymentList.tsx was 100% mock)
  @Get('payments')
  @ApiOperation({ summary: 'Get all payments (admin)' })
  async getPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 20, 200);
    const skip = (pageNum - 1) * limitNum;

    const where = status && status !== 'ALL' ? { status: status as any } : undefined;

    const [total, data] = await Promise.all([
      this.prisma.extended.payment.count({ where }),
      this.prisma.extended.payment.findMany({
        skip,
        take: limitNum,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              user: { select: { id: true, email: true, fullName: true } },
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    };
  }

  // R6 Phase 1: Promos (Voucher) CRUD — FE PromoList.tsx was 100% mock
  @Get('promos')
  @ApiOperation({ summary: 'Get all promotional vouchers' })
  async getPromos(@Query('search') search?: string) {
    const where = search
      ? { code: { contains: search } }
      : undefined;

    const promos = await this.prisma.extended.voucher.findMany({
      where,
      orderBy: { id: 'desc' },
    });
    return { data: promos };
  }

  @Post('promos')
  @ApiOperation({ summary: 'Create a new promotional voucher' })
  async createPromo(@Body() dto: any) {
    const promo = await this.prisma.extended.voucher.create({
      data: {
        code: dto.code,
        discountType: dto.discountType || 'PERCENT',
        discountValue: dto.discountValue || 0,
        minOrderAmount: dto.minOrderAmount || 0,
        maxDiscountAmount: dto.maxDiscountAmount,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
        validTo: dto.validTo ? new Date(dto.validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: dto.usageLimit,
      },
    });
    return { data: promo };
  }

  @Delete('promos/:id')
  @ApiOperation({ summary: 'Delete a promotional voucher' })
  async deletePromo(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.prisma.extended.voucher.delete({ where: { id } });
    return { success: true };
  }

  // R6 Phase 1: Analytics passengers endpoint
  @Get('analytics/passengers')
  @ApiOperation({ summary: 'Get passenger analytics (monthly/daily aggregated)' })
  async getPassengerAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [bookings, passengers] = await Promise.all([
      this.prisma.extended.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.extended.bookingPassenger.findMany({
        where: {
          booking: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        },
        include: { fareClass: true },
      }),
    ]);

    const totalPassengers = passengers.length;
    let economy = 0;
    let business = 0;
    let firstClass = 0;

    passengers.forEach(p => {
      if (p.fareClass?.className === 'ECONOMY') economy++;
      else if (p.fareClass?.className === 'BUSINESS') business++;
      else if (p.fareClass?.className === 'PREMIUM_ECONOMY') firstClass++; // Map premium to first class for now
    });

    const seatDistribution = {
      economy: totalPassengers > 0 ? Math.round((economy / totalPassengers) * 100) : 0,
      business: totalPassengers > 0 ? Math.round((business / totalPassengers) * 100) : 0,
      firstClass: totalPassengers > 0 ? Math.round((firstClass / totalPassengers) * 100) : 0,
    };

    return {
      totalPassengers,
      seatDistribution,
      data: bookings.map(b => ({
        date: b.createdAt,
        count: b._count.id,
      })),
    };
  }
  // R6 Phase 1: Settings CRUD
  @Get('settings')
  @ApiOperation({ summary: 'Get all system settings' })
  async getSettings() {
    const settings = await this.prisma.extended.systemSetting.findMany();
    // Convert array to object
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.settingKey] = s.settingValue;
    }
    return { data: result };
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(@Body() dto: Record<string, string>) {
    const updates = Object.entries(dto).map(async ([key, value]) => {
      return this.prisma.extended.systemSetting.upsert({
        where: { settingKey: key },
        update: { settingValue: value },
        create: { settingKey: key, settingValue: value },
      });
    });
    await Promise.all(updates);
    return { success: true };
  }
}

