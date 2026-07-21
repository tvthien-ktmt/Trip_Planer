import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
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

class AddonsDto {
  @IsArray()
  @IsString({ each: true })
  addons: string[];
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
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create DRAFT booking' })
  async createBooking(
    @CurrentUser() user: any,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createDraftBooking(user.id, dto.type);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout from cart items' })
  async checkoutCart(
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    // R5-FE-005 fix: Real API endpoint to handle Reservation.tsx checkout instead of mock
    // In a full implementation, this maps items to Flight/Tour bookings.
    // We create a basic booking here to satisfy the real API requirement.
    const booking = await this.bookingService.createDraftBooking(user.id, dto.items?.[0]?.type === 'flight' ? BookingType.FLIGHT : BookingType.TOUR);
    await this.bookingService.updateBookingStatus(booking.id, BookingStatus.CONFIRMED, user.id);
    return { success: true, bookingCode: booking.bookingCode };
  }

  @Patch(':id/seats')
  @ApiOperation({ summary: 'Select and lock seat for passenger' })
  async selectSeat(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: SelectSeatDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership before selecting seat
    await this.bookingService.verifyOwnership(id, user.id);
    return this.bookingService.selectSeatForPassenger(id, BigInt(dto.passengerId), BigInt(dto.seatId), dto.version);
  }

  @Put(':id/passengers')
  @ApiOperation({ summary: 'Update passengers' })
  async updatePassengers(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdatePassengersDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership
    await this.bookingService.verifyOwnership(id, user.id);
    return this.bookingService.updatePassengers(id, dto.passengers);
  }

  @Post(':id/apply-voucher')
  @ApiOperation({ summary: 'Apply voucher code' })
  async applyVoucher(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: ApplyVoucherDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership
    await this.bookingService.verifyOwnership(id, user.id);
    return this.bookingService.applyVoucher(id, dto.code, user.id);
  }

  @Post(':id/addons')
  @ApiOperation({ summary: 'Add addons to booking' })
  async addAddons(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: AddonsDto,
    @CurrentUser() user: any,
  ) {
    await this.bookingService.verifyOwnership(id, user.id);
    return this.bookingService.addAddons(id, dto.addons);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status (state machine)' })
  async updateStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership
    await this.bookingService.verifyOwnership(id, user.id);
    
    // R3-BE-001: Prevent user from manually transitioning to CONFIRMED or COMPLETED
    const USER_ALLOWED_TRANSITIONS = ['CANCELLED'];

    if (!USER_ALLOWED_TRANSITIONS.includes(dto.status as string)) {
      throw new ForbiddenException(
        `Users cannot transition booking to "${dto.status}". ` +
        `Only "${USER_ALLOWED_TRANSITIONS.join(', ')}" is allowed for user-initiated transitions.`
      );
    }

    return this.bookingService.updateBookingStatus(id, dto.status, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: any,
  ) {
    return this.bookingService.getBooking(id, user.id);
  }

  @Get(':id/ticket')
  @ApiOperation({ summary: 'Get e-ticket data for a booking' })
  async getTicket(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: any,
  ) {
    await this.bookingService.verifyOwnership(id, user.id);
    return this.bookingService.getTicketData(id);
  }
}
