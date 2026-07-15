import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

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
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role: role as any },
      include: { permission: true },
    });

    return rolePermissions.map((rp) => rp.permission.code);
  }
}
