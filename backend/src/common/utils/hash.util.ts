import * as crypto from 'crypto';

/**
 * Shared hash utility — DRY principle.
 * Used by session.service.ts and auth.service.ts to avoid duplicating hash logic
 * which was the root cause of V5-BE-003 (raw vs hash mismatch in logout).
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
