import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

// R6-DB-003 fix: Map HTTP method → AuditAction enum (POST→CREATE, PATCH/PUT→UPDATE, DELETE→DELETE)
// Without this fix, saving 'POST'/'PATCH' string as enum value throws once migration adds enum type.
const ACTION_MAP: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// R6-DB-003 fix: Map URL path → AuditTarget enum
const TARGET_PATTERNS: Array<{ regex: RegExp; target: string }> = [
  { regex: /\/api\/admin\/users/, target: 'USER' },
  { regex: /\/api\/admin\/bookings/, target: 'BOOKING' },
  { regex: /\/api\/admin\/flights/, target: 'FLIGHT' },
  { regex: /\/api\/admin\/tours/, target: 'TOUR' },
  { regex: /\/api\/admin\/blogs/, target: 'BLOG' },
  { regex: /\/api\/admin\/promos/, target: 'PROMO' },
  { regex: /\/api\/admin\/reviews/, target: 'REVIEW' },
];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, body, ip } = request;

    // Only log mutations for Admin and Staff
    if (method !== 'GET' && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
      return next.handle().pipe(
        tap(async (data) => {
          try {
            const path = originalUrl.split('?')[0];
            // R6-DB-003 fix: Map to valid enum values
            const action = ACTION_MAP[method] ?? 'UPDATE';
            const targetEntry = TARGET_PATTERNS.find(t => t.regex.test(path));
            const targetType = targetEntry?.target ?? 'SETTING';

            await this.prisma.extended.auditLog.create({
              data: {
                adminUserId: user.id,
                action: action as any,
                targetType: targetType as any,
                beforeData: {},
                afterData: data || body,
                ipAddress: ip,
              },
            });
          } catch (e) {
            console.error('Audit Log Error', e);
          }
        }),
      );
    }

    return next.handle();
  }
}
