import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private readonly prismaErrorMap: Record<string, { status: HttpStatus; message: string }> = {
    P2002: { status: HttpStatus.CONFLICT, message: 'Record already exists' },
    P2003: { status: HttpStatus.CONFLICT, message: 'Foreign key constraint failed' },
    P2014: { status: HttpStatus.BAD_REQUEST, message: 'Invalid relation' },
    P2016: { status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Invalid value' },
    P2021: { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Table missing' },
    P2024: { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Database timeout' },
    P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || res;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError || (exception && (exception as any).code && (exception as any).clientVersion)) {
      const prismaError = exception as any;
      const mapped = this.prismaErrorMap[prismaError.code];
      if (mapped) {
        status = mapped.status;
        message = mapped.message;
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database operation failed.';
      }
    } else if (exception instanceof SyntaxError && exception.message.includes('to a BigInt')) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid ID format in request.';
    } else if (exception instanceof Error) {
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
      } else {
        message = exception.message;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method} ${request.url}] ${status} - ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
