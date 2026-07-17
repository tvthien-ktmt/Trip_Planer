import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private algorithm = 'aes-256-cbc';
  private secretKey: Buffer;
  private ivLength = 16;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('APP_SECRET');
    if (!key) {
      throw new Error('[FATAL] APP_SECRET environment variable is not set. Application startup aborted for security.');
    }
    const salt = this.configService.get<string>('APP_SALT') || crypto.randomBytes(16).toString('hex');
    // Ensure key is 32 bytes
    this.secretKey = crypto.scryptSync(key, salt, 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
