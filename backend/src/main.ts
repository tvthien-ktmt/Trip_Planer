import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import hpp from 'hpp';
import * as express from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  // BE-014 fix: Add Helmet, HPP, and body size limits
  app.use(helmet());
  app.use(hpp());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // Create upload directories if they don't exist
  const uploadDirs = ['uploads/avatars', 'uploads/blog', 'uploads/gallery'];
  uploadDirs.forEach((dir) => {
    const fullPath = join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Serve static files (uploaded images)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // BE-004 fix: CORS origin:'*' + credentials:true is invalid (browsers reject it)
  // Use explicit origin whitelist from env var
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Exception Filter
  // Removed duplicated useGlobalFilters(new GlobalExceptionFilter()) here, 
  // because it is registered in app.module.ts via APP_FILTER

  // Swagger API Documentation Setup
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Trip Planner OTA API')
      .setDescription(
        `Enterprise-grade Online Travel Agency API.
        
        **Features:** JWT Auth + Refresh Token Rotation • RBAC + Fine-grained Permissions • Session Management • Booking with Optimistic Locking • VNPay Payment + Idempotency • BullMQ Email Queue • Blog CMS • File Upload • Dashboard Analytics`,
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication, session management, and activity log')
      .addTag('Booking', 'Flight and tour booking with optimistic locking')
      .addTag('Payment', 'VNPay payment integration with idempotency')
      .addTag('Admin Analytics', 'Revenue, booking, user, and route analytics')
      .addTag('RBAC (Admin)', 'Role and permission management')
      .addTag('Blog CMS', 'Blog post CRUD with draft/publish/schedule workflow')
      .addTag('File Upload', 'Avatar, blog image, and gallery upload')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Keep auth across page refreshes
        tagsSorter: 'alpha',
      },
    });
  }

  // Start the server
  const port = process.env.PORT || 3000;
  (BigInt.prototype as any)['toJSON'] = function () {
    return this.toString();
  };
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📖 API Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
