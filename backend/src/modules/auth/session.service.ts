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
    const rawToken = crypto.randomBytes(32).toString('hex');
    const sessionTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Parse device type from user agent
    const deviceType = this.parseDeviceType(params.userAgent);
    const deviceName =
      params.deviceName || this.parseDeviceName(params.userAgent);

    // Mock location from IP (in production, use a geo-ip service)
    const location = await this.resolveGeoLocation(params.ipAddress);

    // R3-BE-007: Store hashed session token
    await this.prisma.extended.userSession.create({
      data: {
        userId: params.userId,
        sessionToken: sessionTokenHash,
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

    return rawToken;
  }

  /**
   * Get all active sessions for a user (for "My Devices" page).
   */
  async getUserSessions(userId: bigint, currentSessionToken?: string) {
    const sessions = await this.prisma.extended.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        location: true,
        userAgent: true,
        isActive: true,
        lastActiveAt: true,
        createdAt: true,
        sessionToken: true,
      },
    });

    const currentHash = currentSessionToken ? crypto.createHash('sha256').update(currentSessionToken).digest('hex') : null;

    return sessions.map((session: any) => ({
      ...session,
      id: session.id.toString(),
      isCurrent: currentHash ? session.sessionToken === currentHash : false,
      sessionToken: undefined, // Don't expose hash to frontend
    }));
  }

  /**
   * Logout from all sessions except current
   */
  async revokeOtherSessions(
    userId: bigint,
    currentSessionToken: string,
  ): Promise<void> {
    const currentHash = crypto.createHash('sha256').update(currentSessionToken).digest('hex');
    await this.prisma.extended.userSession.updateMany({
      where: {
        userId,
        sessionToken: { not: currentHash },
        isActive: true,
      },
      data: { isActive: false },
    });
  }

  /**
   * Revoke a specific session (logout single device).
   */
  async revokeSession(sessionId: bigint, userId: bigint): Promise<void> {
    const result = await this.prisma.extended.userSession.updateMany({
      where: { id: sessionId, userId },
      data: { isActive: false },
    });
    if (result.count === 0) {
      throw new Error('Session not found or not owned by user');
    }
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

    const result = await this.prisma.extended.userSession.updateMany({
      where,
      data: { isActive: false },
    });

    return result.count;
  }

  /**
   * Touch session to update lastActiveAt
   */
  async touchSession(sessionToken: string): Promise<void> {
    const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
    await this.prisma.extended.userSession.updateMany({
      where: { sessionToken: sessionTokenHash, isActive: true },
      data: { lastActiveAt: new Date() },
    });
  }

  /**
   * Find a session by its token (used for token validation)
   */
  async findByToken(sessionToken: string) {
    const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
    return this.prisma.extended.userSession.findFirst({
      where: {
        sessionToken: sessionTokenHash,
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

  private async resolveGeoLocation(ipAddress: string): Promise<string> {
    if (
      !ipAddress ||
      ipAddress === 'unknown' ||
      ipAddress === '::1' ||
      ipAddress === '127.0.0.1' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return 'Local Network';
    }

    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (data.city && data.country_name) {
          return `${data.city}, ${data.country_name}`;
        }
      }
    } catch (e) {
      // Ignore errors and fallback
    }

    return 'Unknown Location';
  }
}
