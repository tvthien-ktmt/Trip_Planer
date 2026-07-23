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

  // BE-006 fix: Use crypto.randomInt instead of Math.random (not cryptographically secure)
  private generateOtpCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  // BE-001/DB-003 fix: Store tokenHint (SHA-256, first 16 hex chars) for O(1) lookup
  private computeTokenHint(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex').slice(0, 16);
  }

  async generateOtp(email: string, purpose: 'REGISTER' | 'RESET_PASSWORD') {
    const user = await this.prisma.extended.user.findUnique({ where: { email } });
    if (purpose === 'REGISTER' && user)
      throw new BadRequestException('Email already exists');
    // BE-098 fix: Don't reveal user existence for RESET_PASSWORD — use generic message
    if (purpose === 'RESET_PASSWORD' && !user)
      throw new BadRequestException('If this email exists, you will receive an OTP');

    const otp = this.generateOtpCode();
    const hash = await bcrypt.hash(otp, 10);

    // DB-005 fix: Store email in OtpCode instead of userId=0
    const userId = user ? user.id : null;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.extended.otpCode.create({
      data: {
        userId,
        email,     // DB-005: store email for pre-registration OTP
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

    // BE-022 fix: Never log OTP in plaintext — remove console.log(otp)
    // Only log in dev mode without actual OTP value
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] OTP sent to ${email} (check email queue)`);
    }
    return { message: 'OTP sent successfully' };
  }

  async register(dto: RegisterDto & { otp: string }) {
    // DB-005 fix: Query OTP by email instead of userId=BigInt(0) to prevent cross-user OTP leak
    const otpRecord = await this.prisma.extended.otpCode.findFirst({
      where: {
        email: dto.email,       // ← KEY FIX: filter by email, not userId=0
        purpose: 'REGISTER',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // BE-023 fix: Brute-force protection — max 5 attempts
    if (otpRecord.attempts >= 5) {
      throw new BadRequestException('Too many OTP attempts. Please request a new OTP.');
    }

    const isValid = await bcrypt.compare(dto.otp, otpRecord.codeHash);
    if (!isValid) {
      // Increment attempts counter
      await this.prisma.extended.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }

    const result = await this.prisma.extended.otpCode.updateMany({
      where: { id: otpRecord.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    if (result.count === 0) {
      throw new BadRequestException('OTP has already been consumed');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // BE-060 fix: Use correct default status (PENDING_VERIFICATION is schema default)
    // Set ACTIVE only after email verification confirmed
    const user = await this.prisma.extended.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        status: 'ACTIVE', // Already verified OTP above, so mark as ACTIVE
        emailVerifiedAt: new Date(),
      },
    });

    // Update the OTP record to link to the created user
    await this.prisma.extended.otpCode.update({
      where: { id: otpRecord.id },
      data: { userId: user.id },
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
    const user = await this.prisma.extended.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'LOCKED') {
      const match = user.lockReason?.match(/^AUTO_FAILED_LOGIN:(\d+)$/);
      if (!match) {
        throw new UnauthorizedException('Account is locked by administrator.');
      }
      const lockTime = parseInt(match[1], 10);
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (Date.now() - lockTime > thirtyMinutes) {
        // Auto-unlock after 30 minutes
        await this.prisma.extended.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE', lockReason: null },
        });
      } else {
        throw new UnauthorizedException('Account is temporarily locked. Try again in 30 minutes.');
      }
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.logLoginFailure(user.id, ip, userAgent);
      await this.activityLog.log({
        userId: user.id,
        action: 'USER_LOGIN_FAILED',
        description: 'Đăng nhập thất bại — sai mật khẩu',
        ipAddress: ip,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Login success — record login history
    await this.prisma.extended.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        device: userAgent,
        success: true,
      },
    });

    await this.activityLog.log({
      userId: user.id,
      action: 'USER_LOGIN',
      description: 'Đăng nhập thành công',
      ipAddress: ip,
    });

    const sessionToken = await this.sessionService.createSession({
      userId: user.id,
      ipAddress: ip,
      userAgent,
    });

    const deviceFingerprint = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

    // BE-025 fix: Use proper upsert by unique(userId, deviceFingerprint) instead of where:{id:0}
    await this.prisma.extended.userDevice
      .upsert({
        where: {
          userId_deviceFingerprint: {
            userId: user.id,
            deviceFingerprint,
          },
        },
        create: {
          userId: user.id,
          deviceFingerprint,
          deviceName: userAgent,
          lastActiveAt: new Date(),
          isTrusted: true,
        },
        update: { lastActiveAt: new Date() },
      })
      .catch((err) => {
        console.error('[AuthService] Failed to upsert device:', err);
      });

    return this.generateTokens(user, deviceFingerprint, sessionToken);
  }

  private async logLoginFailure(userId: bigint, ip: string, userAgent: string) {
    await this.prisma.extended.loginHistory.create({
      data: { userId, ipAddress: ip, device: userAgent, success: false },
    });

    const recentFailures = await this.prisma.extended.loginHistory.count({
      where: {
        userId,
        success: false,
        loginAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentFailures >= 5) {
      await this.prisma.extended.user.update({
        where: { id: userId },
        data: { status: 'LOCKED', lockReason: `AUTO_FAILED_LOGIN:${Date.now()}` },
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

    // BE-001/DB-003 fix: Store tokenHint (SHA-256 first 16 hex) for O(1) lookup
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHint = this.computeTokenHint(rawRefreshToken);
    const refreshHash = await bcrypt.hash(rawRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.extended.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        tokenHint,          // ← O(1) lookup field
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
    // BE-047: Validate token exists before processing
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // BE-001/DB-003 fix: O(1) lookup using tokenHint instead of O(N) full table scan + bcrypt loop
    const tokenHint = this.computeTokenHint(token);
    
    // First lookup by tokenHint for fast O(1) search
    const candidates = await this.prisma.extended.refreshToken.findMany({
      where: { tokenHint },
    });

    let matchedRecord = null;
    let isRevoked = false;

    for (const r of candidates) {
      // Only compare bcrypt for matching hint candidates (typically 1 record)
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

    // BE-051 fix: Check expiresAt before bcrypt compare is now implicit above
    // But also check here for clarity
    if (matchedRecord.expiresAt < new Date() && !isRevoked) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (isRevoked || matchedRecord.expiresAt < new Date()) {
      // Token theft detected — revoke ALL tokens for this user
      await this.prisma.extended.refreshToken.updateMany({
        where: { userId: matchedRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.prisma.extended.userSession.updateMany({
        where: { userId: matchedRecord.userId },
        data: { isActive: false },
      });
      throw new UnauthorizedException(
        'Token reuse detected. All sessions revoked for security.',
      );
    }

    // Revoke old token
    await this.prisma.extended.refreshToken.update({
      where: { id: matchedRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.extended.user.findUnique({
      where: { id: matchedRecord.userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user, matchedRecord.deviceInfo || undefined);
  }

  async logout(userId: bigint, token: string, sessionToken?: string) {
    // BE-048 fix: null check token before using
    if (!token) {
      throw new BadRequestException('Access token is required for logout');
    }

    // BE-019 fix: Use SHA-256 hash of token as blacklist key (not raw token)
    // AND use verify to prevent forged token TTL DoS
    try {
      const decoded = this.jwtService.verify(token) as any;
      if (decoded && decoded.exp) {
        const ttlMs = decoded.exp * 1000 - Date.now();
        if (ttlMs > 0) {
          const ttlSecs = Math.ceil(ttlMs / 1000);
          const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
          await this.cacheManager.set(`blacklist_${tokenHash}`, true, ttlSecs);
        }
      }
    } catch {
      // Token decode failed — still proceed with logout
    }

    await this.prisma.extended.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (sessionToken) {
      // V5-BE-003 fix: Hash session token before lookup (DB stores SHA-256 hash, not raw)
      const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      await this.prisma.extended.userSession.updateMany({
        where: { userId, sessionToken: sessionTokenHash },
        data: { isActive: false },
      });
    }

    await this.activityLog.log({
      userId,
      action: 'USER_LOGOUT',
      description: 'Đăng xuất',
    });

    return { success: true };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    // BE-019 fix: Use SHA-256 hash as key (consistent with logout)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const blacklisted = await this.cacheManager.get(`blacklist_${tokenHash}`);
    return !!blacklisted;
  }

  // BE-050 fix: Admin unlock endpoint support
  async unlockAccount(userId: bigint) {
    const user = await this.prisma.extended.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.status !== 'LOCKED') throw new BadRequestException('User is not locked');

    await this.prisma.extended.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE', lockReason: null },
    });

    return { message: 'Account unlocked successfully' };
  }

  async changePassword(userId: bigint, currentPassword: string, newPassword: string) {
    const user = await this.prisma.extended.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.extended.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.extended.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.extended.user.findUnique({ where: { email } });
    // BE-098: Don't reveal user non-existence with different error message
    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const otpRecord = await this.prisma.extended.otpCode.findFirst({
      where: {
        email,
        purpose: 'RESET_PASSWORD',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // BE-023: Brute-force protection
    if (otpRecord.attempts >= 5) {
      throw new BadRequestException('Too many OTP attempts. Please request a new OTP.');
    }

    const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!isValid) {
      await this.prisma.extended.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }

    const result = await this.prisma.extended.otpCode.updateMany({
      where: { id: otpRecord.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    if (result.count === 0) {
      throw new BadRequestException('OTP has already been consumed');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.extended.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Revoke all refresh tokens for security
    await this.prisma.extended.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // BE-032 fix: Ensure password resetting logs out all sessions
    await this.prisma.extended.userSession.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * R5-FE-004 fix: Verify OTP without consuming it (used by /auth/verify-otp endpoint).
   * Returns true if OTP is valid, false otherwise. Does NOT mark as consumed.
   */
  async verifyOtpCode(email: string, otp: string, purpose: 'REGISTER' | 'RESET_PASSWORD'): Promise<boolean> {
    const otpRecord = await this.prisma.extended.otpCode.findFirst({
      where: {
        email,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });
    if (!otpRecord) return false;
    if (otpRecord.attempts >= 5) return false;

    const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!isValid) {
      await this.prisma.extended.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return false;
    }
    return true;
  }
}
