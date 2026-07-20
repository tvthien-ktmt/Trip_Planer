import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ActivityAction =
  // Auth actions
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_LOGIN_FAILED'
  | 'USER_ACCOUNT_LOCKED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'EMAIL_VERIFIED'
  | 'SESSION_REVOKED'
  | 'ALL_SESSIONS_REVOKED'

  // Booking actions
  | 'BOOKING_CREATED'
  | 'BOOKING_SEAT_SELECTED'
  | 'BOOKING_PASSENGER_UPDATED'
  | 'BOOKING_VOUCHER_APPLIED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'

  // Payment actions
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REFUND_REQUESTED'
  | 'REFUND_APPROVED'
  | 'REFUND_REJECTED'

  // Profile actions
  | 'PROFILE_UPDATED'
  | 'AVATAR_UPLOADED'

  // Wishlist & Review
  | 'WISHLIST_ADDED'
  | 'WISHLIST_REMOVED'
  | 'REVIEW_SUBMITTED';

export interface ActivityLogParams {
  userId: bigint;
  action: ActivityAction;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Activity Log Service
 *
 * Records user-facing actions for the "Activity History" feature.
 * Different from AuditLog (which is admin-only).
 *
 * Usage:
 *   this.activityLog.log({
 *     userId: user.id,
 *     action: 'BOOKING_CREATED',
 *     description: 'Tạo booking chuyến bay SGN→HAN',
 *     metadata: { bookingId: '123', bookingCode: 'ABC123' },
 *     ipAddress: req.ip,
 *   });
 */
@Injectable()
export class ActivityLogService {
  constructor(@Optional() private prisma: PrismaService) {}

  /**
   * Log an activity. Fails silently to avoid breaking the main flow.
   */
  async log(params: ActivityLogParams): Promise<void> {
    if (!this.prisma) return;

    try {
      await this.prisma.extended.activityLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          description: params.description,
          metadata: params.metadata as any,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      // Silently fail — activity logging should never break the main operation
      console.error('[ActivityLog] Failed to log activity:', error.message);
    }
  }

  /**
   * Get activity log for a specific user.
   * Used by GET /api/user/activity-log endpoint.
   */
  async getUserActivity(
    userId: bigint,
    options: { page?: number; limit?: number; action?: ActivityAction } = {},
  ) {
    const { page = 1, limit = 20, action } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (action) where.action = action;

    const [total, logs] = await Promise.all([
      this.prisma.extended.activityLog.count({ where }),
      this.prisma.extended.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          description: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: logs.map((log) => ({
        ...log,
        id: log.id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get action label in Vietnamese for display.
   */
  static getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      USER_LOGIN: '🔐 Đăng nhập thành công',
      USER_LOGOUT: '👋 Đăng xuất',
      USER_REGISTER: '✅ Đăng ký tài khoản',
      USER_LOGIN_FAILED: '❌ Đăng nhập thất bại',
      USER_ACCOUNT_LOCKED: '🔒 Tài khoản bị khóa',
      PASSWORD_CHANGED: '🔑 Đổi mật khẩu',
      EMAIL_VERIFIED: '📧 Xác thực email',
      SESSION_REVOKED: '📱 Đăng xuất khỏi thiết bị',
      ALL_SESSIONS_REVOKED: '🚫 Đăng xuất tất cả thiết bị',
      BOOKING_CREATED: '📋 Tạo đặt chỗ',
      BOOKING_CONFIRMED: '✈️ Đặt chỗ được xác nhận',
      BOOKING_CANCELLED: '❌ Hủy đặt chỗ',
      BOOKING_COMPLETED: '🎉 Hoàn thành chuyến đi',
      PAYMENT_INITIATED: '💳 Khởi tạo thanh toán',
      PAYMENT_SUCCESS: '✅ Thanh toán thành công',
      PAYMENT_FAILED: '❌ Thanh toán thất bại',
      REFUND_REQUESTED: '💰 Yêu cầu hoàn tiền',
      REFUND_APPROVED: '✅ Hoàn tiền được chấp thuận',
      PROFILE_UPDATED: '👤 Cập nhật hồ sơ',
      AVATAR_UPLOADED: '🖼️ Cập nhật ảnh đại diện',
      WISHLIST_ADDED: '❤️ Thêm vào yêu thích',
      REVIEW_SUBMITTED: '⭐ Đánh giá',
    };

    return labels[action] || action;
  }
}
