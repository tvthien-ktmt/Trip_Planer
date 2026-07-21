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
    const user = await this.prisma.extended.user.update({
      where: { id: id },
      data: dto,
    });
    return { data: user };
  }

  @Patch('users/:id/lock')
  async lockUser(@Param('id', ParseBigIntPipe) id: bigint) {
    const user = await this.prisma.extended.user.findUnique({ where: { id: id } });
    const newStatus = user?.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    await this.prisma.extended.user.update({
      where: { id: id },
      data: { status: newStatus },
    });
    return { success: true };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseBigIntPipe) id: bigint) {
    await this.prisma.extended.user.update({
      where: { id: id },
      data: { deletedAt: new Date() },
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
      }),
    ]);

    return {
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    };
  }
}
