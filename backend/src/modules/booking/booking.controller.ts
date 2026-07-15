import {
  Controller,
  Post,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Booking')
@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create DRAFT booking' })
  async createBooking(
    @CurrentUser() user: any,
    @Body('type') type: 'FLIGHT' | 'TOUR',
  ) {
    return this.bookingService.createDraftBooking(user.id, type);
  }

  @Patch(':id/seats')
  @ApiOperation({ summary: 'Select and lock seat' })
  async selectSeat(
    @Param('id') id: string,
    @Body('seatId') seatId: string,
    @Body('version') version: number,
  ) {
    return this.bookingService.selectSeat(BigInt(id), BigInt(seatId), version);
  }

  @Put(':id/passengers')
  @ApiOperation({ summary: 'Update passengers' })
  async updatePassengers(
    @Param('id') id: string,
    @Body('passengers') passengers: any[],
  ) {
    return this.bookingService.updatePassengers(BigInt(id), passengers);
  }

  @Post(':id/apply-voucher')
  @ApiOperation({ summary: 'Apply voucher code' })
  async applyVoucher(
    @Param('id') id: string,
    @Body('code') code: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingService.applyVoucher(BigInt(id), code, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status (state machine)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingService.updateBookingStatus(BigInt(id), status, user.id);
  }
}
