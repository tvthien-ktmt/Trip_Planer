import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  Headers,
  Get,
  Param,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { RegisterWithOtpDto, LoginDto, SendOtpDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Post('send-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 mins
  @ApiOperation({ summary: 'Send OTP for registration or password reset' })
  @ApiResponse({
    status: 201,
    description: 'OTP sent to email (dev: logged to console)',
  })
  @ApiResponse({ status: 400, description: 'Email already exists / not found' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.generateOtp(dto.email, dto.purpose);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with OTP verification' })
  @ApiResponse({ status: 201, description: 'User registered, tokens returned' })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or email already taken',
  })
  async register(@Body() dto: RegisterWithOtpDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // R3-BE-009: 5 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — returns JWT access token + refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  async login(
    @Body() dto: LoginDto, 
    @Req() req: Request
  ) {
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Token — rotates old refresh token for new pair',
  })
  @ApiResponse({ status: 200, description: 'New access + refresh token pair' })
  @ApiResponse({ status: 401, description: 'Invalid or reused refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout — blacklists access token and revokes refresh tokens',
  })
  async logout(
    @CurrentUser() user: any,
    @Headers('authorization') authHeader: string,
    @Body('session_token') sessionToken?: string,
  ) {
    // BE-048 fix: Null check authHeader before split
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, message: 'Invalid authorization header' };
    }
    const token = authHeader.split(' ')[1];
    return this.authService.logout(user.id, token, sessionToken);
  }

  // ===== SESSION MANAGEMENT =====

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active sessions (My Devices)' })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions across all devices',
    schema: {
      example: [
        {
          id: '1',
          deviceName: 'Chrome on Windows',
          deviceType: 'Chrome',
          ipAddress: '192.168.1.1',
          location: 'Ho Chi Minh City, Vietnam',
          lastActiveAt: '2026-07-14T10:00:00Z',
          createdAt: '2026-07-14T08:00:00Z',
          isCurrent: true,
        },
      ],
    },
  })
  async getSessions(
    @CurrentUser() user: any,
    @Headers('x-session-token') currentSessionToken?: string,
  ) {
    return this.sessionService.getUserSessions(user.id, currentSessionToken);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout specific device (revoke one session)' })
  async revokeSession(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: any,
  ) {
    await this.sessionService.revokeSession(id, user.id);
    await this.activityLog.log({
      userId: user.id,
      action: 'SESSION_REVOKED',
      description: `Đăng xuất khỏi thiết bị #${id}`,
      metadata: { sessionId: id.toString() },
    });
    return { success: true, message: 'Session revoked' };
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all devices (revoke all sessions)' })
  async revokeAllSessions(@CurrentUser() user: any) {
    const count = await this.sessionService.revokeAllSessions(user.id);
    await this.activityLog.log({
      userId: user.id,
      action: 'ALL_SESSIONS_REVOKED',
      description: `Đăng xuất tất cả ${count} thiết bị`,
    });
    return { success: true, message: `Revoked ${count} sessions`, count };
  }

  // ===== ACTIVITY LOG =====

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getActivity(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.activityLog.getUserActivity(user.id, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  // BE-050: Admin unlock endpoint
  @Post('admin/unlock/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: unlock a locked user account' })
  async unlockAccount(
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin only');
    }
    return this.authService.unlockAccount(BigInt(userId));
  }

  // Reset password endpoint
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  // ===== OTP VERIFICATION (for FE VerifyOTP.tsx) =====

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code for password reset or email verification' })
  async verifyOtp(@Body() body: { email: string; otp: string; purpose: string }) {
    // Validate OTP without consuming it (just check)
    const isValid = await this.authService.verifyOtpCode(body.email, body.otp, body.purpose as any);
    if (!isValid) {
      const { BadRequestException: BadReq } = await import('@nestjs/common');
      throw new BadReq('OTP không đúng hoặc đã hết hạn');
    }
    return { success: true, message: 'OTP hợp lệ' };
  }

  // ===== DEVICE MANAGEMENT ALIASES =====

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alias: List active devices (same as /sessions)' })
  async getDevices(
    @CurrentUser() user: any,
    @Headers('x-session-token') currentSessionToken?: string,
  ) {
    return this.sessionService.getUserSessions(user.id, currentSessionToken);
  }

  @Delete('devices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alias: Logout specific device (revoke one session)' })
  async revokeDevice(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: any,
  ) {
    await this.sessionService.revokeSession(id, user.id);
    return { success: true, message: 'Device logged out' };
  }

  @Post('devices/revoke-others')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout all devices except current' })
  async revokeOtherDevices(
    @CurrentUser() user: any,
    @Headers('x-session-token') currentSessionToken?: string,
  ) {
    if (currentSessionToken) {
      await this.sessionService.revokeOtherSessions(user.id, currentSessionToken);
    } else {
      // Revoke all if no session token provided
      await this.sessionService.revokeAllSessions(user.id);
    }
    return { success: true, message: 'Other devices logged out' };
  }

  // ===== LOGIN HISTORY =====

  @Get('login-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get login history (active sessions list)' })
  async getLoginHistory(
    @CurrentUser() user: any,
  ) {
    // Return sessions as login history with mapped fields
    const sessions = await this.sessionService.getUserSessions(user.id);
    return sessions.map((s: any) => ({
      id: s.id,
      device: s.deviceName || 'Unknown Device',
      ipAddress: s.location || s.ipAddress || 'Unknown',
      loginAt: s.createdAt || s.lastActiveAt,
      lastActiveAt: s.lastActiveAt,
      success: s.isActive !== false,
    }));
  }
}

