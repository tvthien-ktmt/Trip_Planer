import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Headers,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
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
  async sendOtp(
    @Body('email') email: string,
    @Body('purpose') purpose: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER',
  ) {
    return this.authService.generateOtp(email, purpose);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with OTP verification' })
  @ApiResponse({ status: 201, description: 'User registered, tokens returned' })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or email already taken',
  })
  async register(@Body() dto: RegisterDto & { otp: string }) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — returns JWT access token + refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGci...',
        refresh_token: 'abc123def...',
        session_token: 'xyz789...',
        user: {
          id: '1',
          email: 'user@example.com',
          fullName: 'Nguyen Van A',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or locked account',
  })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
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
  async refresh(@Body('refresh_token') token: string) {
    return this.authService.refreshToken(token);
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
    const sessions = await this.sessionService.getUserSessions(user.id);
    // Mark current session
    return sessions.map((s) => ({
      ...s,
      isCurrent: false, // Would compare with currentSessionToken in production
    }));
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout specific device (revoke one session)' })
  async revokeSession(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    await this.sessionService.revokeSession(BigInt(id), user.id);
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
}
