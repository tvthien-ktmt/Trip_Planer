import {
  Controller,
  Post,
  Patch,
  Put,
  Get,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';

import { BookingType, BookingStatus } from '@prisma/client';

// BE-020: Add proper DTOs
class CreateBookingDto {
  @IsEnum(BookingType)
  @IsNotEmpty()
  type: BookingType;
}

class SelectSeatDto {
  @IsString()
  @IsNotEmpty()
  passengerId: string;

  @IsString()
  @IsNotEmpty()
  seatId: string;

  @IsNumber()
  version: number;
}

class PassengerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  passportNo?: string;

  @IsString()
  @IsOptional()
  fareClassId?: string;
}

class UpdatePassengersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}

class ApplyVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

class UpdateStatusDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}

@ApiTags('Booking')
@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly prisma: PrismaService,
  ) {}

  // BE-008 fix: Helper to verify ownership
  private async verifyOwnership(bookingId: bigint, userId: bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }
    return booking;
  }

  @Post()
  @ApiOperation({ summary: 'Create DRAFT booking' })
  async createBooking(
    @CurrentUser() user: any,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createDraftBooking(user.id, dto.type);
  }

  @Patch(':id/seats')
  @ApiOperation({ summary: 'Select and lock seat for passenger' })
  async selectSeat(
    @Param('id') id: string,
    @Body() dto: SelectSeatDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership before selecting seat
    await this.verifyOwnership(BigInt(id), user.id);
    return this.bookingService.selectSeatForPassenger(BigInt(id), BigInt(dto.passengerId), BigInt(dto.seatId), dto.version);
  }

  @Put(':id/passengers')
  @ApiOperation({ summary: 'Update passengers' })
  async updatePassengers(
    @Param('id') id: string,
    @Body() dto: UpdatePassengersDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership
    await this.verifyOwnership(BigInt(id), user.id);
    return this.bookingService.updatePassengers(BigInt(id), dto.passengers);
  }

  @Post(':id/apply-voucher')
  @ApiOperation({ summary: 'Apply voucher code' })
  async applyVoucher(
    @Param('id') id: string,
    @Body() dto: ApplyVoucherDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership
    await this.verifyOwnership(BigInt(id), user.id);
    return this.bookingService.applyVoucher(BigInt(id), dto.code, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status (state machine)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership
    await this.verifyOwnership(BigInt(id), user.id);
    return this.bookingService.updateBookingStatus(BigInt(id), dto.status, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership before fetching details
    const booking = await this.verifyOwnership(BigInt(id), user.id);
    return this.prisma.booking.findUnique({
      where: { id: BigInt(id) },
      include: {
        passengers: true,
        items: true,
        statusHistory: true,
        payment: {
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
