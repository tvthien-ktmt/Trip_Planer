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

  @Patch(':id/seats')
  @ApiOperation({ summary: 'Select and lock seat for passenger' })
  async selectSeat(
    @Param('id') id: string,
    @Body() dto: SelectSeatDto,
    @CurrentUser() user: any,
  ) {
    // BE-008: Verify ownership before selecting seat
    await this.bookingService.verifyOwnership(BigInt(id), user.id);
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
    await this.bookingService.verifyOwnership(BigInt(id), user.id);
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
    await this.bookingService.verifyOwnership(BigInt(id), user.id);
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
    await this.bookingService.verifyOwnership(BigInt(id), user.id);
    
    // R3-BE-001: Prevent user from manually transitioning to CONFIRMED or COMPLETED
    const USER_ALLOWED_TRANSITIONS = ['CANCELLED'];

    if (!USER_ALLOWED_TRANSITIONS.includes(dto.status as string)) {
      throw new ForbiddenException(
        `Users cannot transition booking to "${dto.status}". ` +
        `Only "${USER_ALLOWED_TRANSITIONS.join(', ')}" is allowed for user-initiated transitions.`
      );
    }

    return this.bookingService.updateBookingStatus(BigInt(id), dto.status, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingService.getBooking(BigInt(id), user.id);
  }
}
