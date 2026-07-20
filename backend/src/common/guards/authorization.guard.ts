import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { rolePermissionsCacheKey } from '../constants/cache-keys';

/**
 * Authorization Guard — checks both Role and Permission.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, AuthorizationGuard)
 *   @Roles('ADMIN')
 *   @Permissions('USER_DELETE')
 *
 * Logic:
 *   1. If no roles AND no permissions required → allow
 *   2. If roles required → check user.role matches
 *   3. If permissions required → query DB for role-based permissions
 *   4. Both must pass if both decorators used
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No restrictions — public route
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check role
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(
          `Requires one of roles: [${requiredRoles.join(', ')}]. Current role: ${user.role}`,
        );
      }
    }

    // Check fine-grained permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = await this.getUserPermissions(user.role);
      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.includes(perm),
      );

      if (!hasAllPermissions) {
        const missing = requiredPermissions.filter(
          (p) => !userPermissions.includes(p),
        );
        throw new ForbiddenException(
          `Missing permissions: [${missing.join(', ')}]`,
        );
      }
    }

    return true;
  }

  /**
   * Fetch all permissions for a given role from DB.
   * Could be cached in Redis for production performance.
   */
  private async getUserPermissions(role: string): Promise<string[]> {
    const cacheKey = rolePermissionsCacheKey(role);
    const cachedPermissions = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedPermissions) {
      return cachedPermissions;
    }

    const rolePermissions = await this.prisma.extended.rolePermission.findMany({
      where: { role: role as any },
      include: { permission: true },
    });

    const permissions = rolePermissions.map((rp) => rp.permission.code);
    await this.cacheManager.set(cacheKey, permissions, 300); // 5 minutes TTL
    return permissions;
  }
}
