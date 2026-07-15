import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FlightModule } from './modules/flight/flight.module';
import { TourModule } from './modules/tour/tour.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ReviewModule } from './modules/review/review.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { AdminModule } from './modules/admin/admin.module';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { MembershipModule } from './modules/membership/membership.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { EmailModule } from './modules/email/email.module';
import { BlogModule } from './modules/blog/blog.module';
import { UploadModule } from './modules/upload/upload.module';
import * as redisStore from 'cache-manager-ioredis';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        APP_SECRET: Joi.string().optional().default('app-secret-default'),
        VNPAY_HASH_SECRET: Joi.string().optional(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // global limit: 100 reqs/min
      },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 60, // default ttl 60s
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    FlightModule,
    TourModule,
    BookingModule,
    PaymentModule,
    ReviewModule,
    WishlistModule,
    AdminModule,
    MembershipModule,
    NotificationModule,
    RbacModule,
    EmailModule,
    BlogModule,
    UploadModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Global rate limiter
    },
  ],
})
export class AppModule {}
