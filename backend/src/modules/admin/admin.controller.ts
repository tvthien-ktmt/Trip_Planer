import {
  Controller,
  Get,
  Patch,
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
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: any,
  ) {
    // BE-042 fix: Use BookingService state machine, not hardcoded 'CONFIRMED'
    const booking = await this.prisma.extended.booking.findUnique({
      where: { id: BigInt(id) },
    });
    if (!booking) throw new BadRequestException('Booking not found');

    if (!this.bookingService.canTransition(booking.status, dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${dto.status}`,
      );
    }

    // BE-037: Admin `updateBookingStatus` use service method to ensure history & points
    await this.bookingService.updateBookingStatus(BigInt(id), dto.status, user.id);

    return { success: true, status: dto.status };
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
