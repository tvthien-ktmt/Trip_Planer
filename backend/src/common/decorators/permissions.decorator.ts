import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions on a route.
 * Works together with AuthorizationGuard.
 *
 * @example
 * @Permissions('USER_DELETE', 'USER_LOCK')
 * @Delete(':id')
 * deleteUser(@Param('id') id: string) { ... }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
