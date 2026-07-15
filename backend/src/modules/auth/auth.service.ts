import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SessionService } from './session.service';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private activityLog: ActivityLogService,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async generateOtp(email: string, purpose: 'REGISTER' | 'RESET_PASSWORD') {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (purpose === 'REGISTER' && user)
      throw new BadRequestException('Email already exists');
    if (purpose === 'RESET_PASSWORD' && !user)
      throw new BadRequestException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(otp, 10);

    // Default userId to 0 if registering and user doesn't exist yet
    const userId = user ? user.id : BigInt(0);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.otpCode.create({
      data: {
        userId,
        codeHash: hash,
        purpose,
        expiresAt,
      },
    });

    // Enqueue email via BullMQ (async — doesn't block response)
    if (purpose === 'REGISTER') {
      await this.emailService
        .sendVerifyEmail({
          to: email,
          fullName: user?.fullName || 'Người dùng',
          otp,
        })
        .catch((err) =>
          console.error('[AuthService] Failed to queue verify email:', err),
        );
    } else if (purpose === 'RESET_PASSWORD' && user) {
      await this.emailService
        .sendPasswordReset({
          to: email,
          fullName: user.fullName,
          otp,
        })
        .catch((err) =>
          console.error('[AuthService] Failed to queue reset email:', err),
        );
    }

    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return { message: 'OTP sent successfully' };
  }

  async register(dto: RegisterDto & { otp: string }) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { userId: BigInt(0), purpose: 'REGISTER', consumedAt: null },
      orderBy: { id: 'desc' },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isValid = await bcrypt.compare(dto.otp, otpRecord.codeHash);
    if (!isValid) throw new BadRequestException('Invalid OTP');

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });

    // Log registration activity
    await this.activityLog.log({
      userId: user.id,
      action: 'USER_REGISTER',
      description: `Đăng ký tài khoản mới: ${user.email}`,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'LOCKED') {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.logLoginFailure(user.id, ip, userAgent);
      // Log failed login activity
      await this.activityLog.log({
        userId: user.id,
        action: 'USER_LOGIN_FAILED',
        description: 'Đăng nhập thất bại — sai mật khẩu',
        ipAddress: ip,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Login success — record login history
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        device: userAgent,
        success: true,
      },
    });

    // Log login activity
    await this.activityLog.log({
      userId: user.id,
      action: 'USER_LOGIN',
      description: 'Đăng nhập thành công',
      ipAddress: ip,
    });

    // Create Session record (for "My Devices" feature)
    const sessionToken = await this.sessionService.createSession({
      userId: user.id,
      ipAddress: ip,
      userAgent,
    });

    // Create Device Fingerprint
    const deviceFingerprint = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

    await this.prisma.userDevice
      .upsert({
        where: { id: 0 },
        create: {
          userId: user.id,
          deviceFingerprint,
          deviceName: userAgent,
          lastActiveAt: new Date(),
          isTrusted: true,
        },
        update: { lastActiveAt: new Date() },
      })
      .catch(async () => {
        const existing = await this.prisma.userDevice.findFirst({
          where: { userId: user.id, deviceFingerprint },
        });
        if (existing) {
          await this.prisma.userDevice.update({
            where: { id: existing.id },
            data: { lastActiveAt: new Date() },
          });
        } else {
          await this.prisma.userDevice.create({
            data: {
              userId: user.id,
              deviceFingerprint,
              deviceName: userAgent,
              lastActiveAt: new Date(),
              isTrusted: true,
            },
          });
        }
      });

    return this.generateTokens(user, deviceFingerprint, sessionToken);
  }

  private async logLoginFailure(userId: bigint, ip: string, userAgent: string) {
    await this.prisma.loginHistory.create({
      data: { userId, ipAddress: ip, device: userAgent, success: false },
    });

    // Check lock after 5 failures in 15 mins
    const recentFailures = await this.prisma.loginHistory.count({
      where: {
        userId,
        success: false,
        loginAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentFailures >= 5) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: 'LOCKED' },
      });
      await this.activityLog.log({
        userId,
        action: 'USER_ACCOUNT_LOCKED',
        description: 'Tài khoản bị khóa do đăng nhập sai quá 5 lần',
        ipAddress: ip,
      });
    }
  }

  private async generateTokens(
    user: any,
    deviceInfo?: string,
    sessionToken?: string,
  ) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshHash = await bcrypt.hash(rawRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt,
        deviceInfo,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: rawRefreshToken,
      session_token: sessionToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refreshToken(token: string) {
    // Rotation logic — check ALL records for theft detection
    const allRecords = await this.prisma.refreshToken.findMany();
    let matchedRecord = null;
    let isRevoked = false;

    for (const r of allRecords) {
      if (await bcrypt.compare(token, r.tokenHash)) {
        matchedRecord = r;
        if (r.revokedAt) {
          isRevoked = true;
        }
        break;
      }
    }

    if (!matchedRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (isRevoked || matchedRecord.expiresAt < new Date()) {
      // Token theft detected — revoke ALL tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId: matchedRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.prisma.userSession.updateMany({
        where: { userId: matchedRecord.userId },
        data: { isActive: false },
      });
      throw new UnauthorizedException(
        'Token reuse detected. All sessions revoked for security.',
      );
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: matchedRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: matchedRecord.userId },
    });
    return this.generateTokens(user, matchedRecord.deviceInfo || undefined);
  }

  async logout(userId: bigint, token: string, sessionToken?: string) {
    // Blacklist access token in Redis
    const decoded = this.jwtService.decode(token);
    const ttl = decoded.exp * 1000 - Date.now();
    if (ttl > 0) {
      await this.cacheManager.set(`blacklist_${token}`, true, ttl);
    }

    // Revoke refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Revoke session if provided
    if (sessionToken) {
      await this.prisma.userSession.updateMany({
        where: { userId, sessionToken },
        data: { isActive: false },
      });
    }

    // Log activity
    await this.activityLog.log({
      userId,
      action: 'USER_LOGOUT',
      description: 'Đăng xuất',
    });

    return { success: true };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.cacheManager.get(`blacklist_${token}`);
    return !!blacklisted;
  }
}
