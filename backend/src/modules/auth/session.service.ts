import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session when user logs in.
   * Returns the session token (stored in DB as unique identifier).
   */
  async createSession(params: {
    userId: bigint;
    ipAddress: string;
    userAgent: string;
    deviceName?: string;
  }): Promise<string> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Parse device type from user agent
    const deviceType = this.parseDeviceType(params.userAgent);
    const deviceName =
      params.deviceName || this.parseDeviceName(params.userAgent);

    // Mock location from IP (in production, use a geo-ip service)
    const location = await this.mockGeoLocation(params.ipAddress);

    await this.prisma.userSession.create({
      data: {
        userId: params.userId,
        sessionToken,
        deviceName,
        deviceType,
        ipAddress: params.ipAddress,
        location,
        userAgent: params.userAgent,
        isActive: true,
        lastActiveAt: new Date(),
        expiresAt,
      },
    });

    return sessionToken;
  }

  /**
   * Get all active sessions for a user (for "My Devices" page).
   */
  async getUserSessions(userId: bigint) {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id.toString(),
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      ipAddress: session.ipAddress,
      location: session.location,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
      isCurrent: false, // Will be set by controller based on current token
    }));
  }

  /**
   * Revoke a specific session (logout single device).
   */
  async revokeSession(sessionId: bigint, userId: bigint): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        userId, // Security: only owner can revoke their own session
      },
      data: { isActive: false },
    });
  }

  /**
   * Revoke all sessions for a user (logout all devices).
   */
  async revokeAllSessions(
    userId: bigint,
    exceptSessionId?: bigint,
  ): Promise<number> {
    const where: any = {
      userId,
      isActive: true,
    };

    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }

    const result = await this.prisma.userSession.updateMany({
      where,
      data: { isActive: false },
    });

    return result.count;
  }

  /**
   * Update lastActiveAt timestamp for the current session.
   */
  async touchSession(sessionToken: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { sessionToken, isActive: true },
      data: { lastActiveAt: new Date() },
    });
  }

  /**
   * Find session by token — used for session-based auth flow.
   */
  async findByToken(sessionToken: string) {
    return this.prisma.userSession.findFirst({
      where: {
        sessionToken,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });
  }

  // ===== Private helpers =====

  private parseDeviceType(userAgent: string): string {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();
    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Browser';
  }

  private parseDeviceName(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';

    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) {
      if (ua.includes('chrome')) return 'Chrome on Windows';
      if (ua.includes('firefox')) return 'Firefox on Windows';
      if (ua.includes('edge')) return 'Edge on Windows';
      return 'Windows Browser';
    }
    if (ua.includes('mac os') || ua.includes('macintosh')) {
      if (ua.includes('chrome')) return 'Chrome on macOS';
      if (ua.includes('safari')) return 'Safari on macOS';
      return 'macOS Browser';
    }
    if (ua.includes('linux')) return 'Linux Browser';
    if (ua.includes('android')) return 'Android Device';
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';

    return 'Unknown Device';
  }

  private async mockGeoLocation(ipAddress: string): Promise<string> {
    // In production, use a real geo-IP service (e.g., ipapi.co, MaxMind)
    // For demo, return reasonable defaults based on common IP ranges
    if (
      !ipAddress ||
      ipAddress === 'unknown' ||
      ipAddress === '::1' ||
      ipAddress === '127.0.0.1'
    ) {
      return 'Local (Development)';
    }
    if (
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return 'Local Network';
    }
    // Default for demo
    return 'Ho Chi Minh City, Vietnam';
  }
}
