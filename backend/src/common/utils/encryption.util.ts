import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const isTestEnv = process.env.NODE_ENV === 'test';
const rawKey = process.env.ENCRYPTION_KEY || (isTestEnv ? '12345678901234567890123456789012' : undefined);
if (!rawKey || Buffer.byteLength(rawKey, 'utf8') !== 32) {
  // We cannot throw at module load level safely in all test environments if they don't load env vars first,
  // but it's required for production.
  throw new Error('[FATAL] ENCRYPTION_KEY must be exactly 32 bytes');
}
const ENCRYPTION_KEY = Buffer.from(rawKey, 'utf8');

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
  if (!text || !text.startsWith('enc:')) return text;
  try {
    const parts = text.split(':');
    let ivHex, authTagHex, encryptedHex;
    if (parts.length === 5 && parts[1] === 'v1') {
      [, , ivHex, authTagHex, encryptedHex] = parts;
    } else if (parts.length === 4) {
      [, ivHex, authTagHex, encryptedHex] = parts;
    } else {
      throw new Error('Invalid ciphertext format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('Decryption failed', e);
    throw new Error('DecryptionException: Failed to decrypt data');
  }
}
