import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!jwtSecret) {
      throw new Error(
        '[FATAL] JWT_ACCESS_SECRET environment variable is not set. Application startup aborted for security.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // BE-003 fix: No fallback to 'secret'
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // R5-BE-009 fix: Null check on authorization header
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // BE-023/024 fix: Check if user is soft-deleted or locked and select only needed fields
    const user = await this.prisma.extended.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        deletedAt: true,
        avatarUrl: true,
      },
    });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User account has been deleted');
    }
    if (user.status === 'LOCKED') {
      throw new UnauthorizedException('User account is locked');
    }
    return user;
  }
}
