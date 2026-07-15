import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  async getBookings() {
    return this.prisma.booking.findMany({
      include: { user: true, payment: true },
      take: 50,
    });
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateBookingStatus(@Param('id') id: string) {
    return this.prisma.booking.update({
      where: { id: BigInt(id) },
      data: { status: 'CONFIRMED' },
    });
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View audit logs' })
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }
}
