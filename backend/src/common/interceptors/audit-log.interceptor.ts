import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, body, ip } = request;

    // Only log mutations for Admin
    if (method !== 'GET' && user?.role === 'ADMIN') {
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.prisma.auditLog.create({
              data: {
                adminUserId: user.id,
                action: method,
                targetType: originalUrl.split('?')[0],
                beforeData: {}, // Complex to implement generic before data without specific service hooks
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
