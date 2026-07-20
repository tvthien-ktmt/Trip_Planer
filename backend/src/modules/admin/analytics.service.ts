import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Revenue analytics — total revenue by day/week/month.
   */
  async getRevenue(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const { startDate, groupFormat } = this.getPeriodConfig(period);

    // Total revenue (SUCCESS payments)
    const totalRevenue = await this.prisma.extended.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    // Revenue this period — use Payment.createdAt as proxy
    const periodRevenue = await this.prisma.extended.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    });

    // Revenue by day (last 30 days)
    const rawRevenue = await this.prisma.$queryRaw<
      Array<{ date: string; revenue: number; count: number }>
    >`
      SELECT 
        DATE_FORMAT(b.createdAt, ${groupFormat}) as date,
        SUM(p.amount) as revenue,
        COUNT(p.id) as count
      FROM Payment p
      JOIN Booking b ON p.bookingId = b.id
      WHERE p.status = 'SUCCESS' AND b.createdAt >= ${startDate}
      GROUP BY DATE_FORMAT(b.createdAt, ${groupFormat})
      ORDER BY date ASC
    `;

    // Top payment methods
    const methodBreakdown = await this.prisma.extended.payment.groupBy({
      by: ['method'],
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      periodRevenue: Number((periodRevenue._sum as any)?.amount || 0),
      trend: rawRevenue.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue),
        count: Number(r.count),
      })),
      byMethod: methodBreakdown.map((m) => ({
        method: m.method,
        total: Number(m._sum.amount || 0),
        count: m._count,
      })),
    };
  }

  /**
   * Booking analytics — booking counts by status and time.
   */
  async getBookings(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const { startDate, groupFormat } = this.getPeriodConfig(period);

    const [total, byStatus, byType, trend] = await Promise.all([
      this.prisma.extended.booking.count(),

      this.prisma.extended.booking.groupBy({
        by: ['status'],
        _count: true,
      }),

      this.prisma.extended.booking.groupBy({
        by: ['type'],
        _count: true,
        _sum: { totalAmount: true },
      }),

      this.prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT 
          DATE_FORMAT(createdAt, ${groupFormat}) as date,
          COUNT(id) as count
        FROM Booking
        WHERE createdAt >= ${startDate}
        GROUP BY DATE_FORMAT(createdAt, ${groupFormat})
        ORDER BY date ASC
      `,
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
        revenue: Number(t._sum.totalAmount || 0),
      })),
      trend: trend.map((t) => ({ date: t.date, count: Number(t.count) })),
    };
  }

  /**
   * User analytics — growth over time and status breakdown.
   */
  async getUsers(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const { startDate, groupFormat } = this.getPeriodConfig(period);

    const [total, byStatus, byRole, growth, newThisPeriod] = await Promise.all([
      this.prisma.extended.user.count(),

      this.prisma.extended.user.groupBy({
        by: ['status'],
        _count: true,
      }),

      this.prisma.extended.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      this.prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT 
          DATE_FORMAT(createdAt, ${groupFormat}) as date,
          COUNT(id) as count
        FROM User
        WHERE createdAt >= ${startDate}
        GROUP BY DATE_FORMAT(createdAt, ${groupFormat})
        ORDER BY date ASC
      `,

      this.prisma.extended.user.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    return {
      total,
      newThisPeriod,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byRole: byRole.map((r) => ({ role: r.role, count: r._count })),
      growth: growth.map((g) => ({ date: g.date, count: Number(g.count) })),
    };
  }

  /**
   * Top routes — most booked flight routes.
   */
  async getTopRoutes(limit = 10) {
    const routes = await this.prisma.$queryRaw<
      Array<{
        departureCode: string;
        arrivalCode: string;
        departureCity: string;
        arrivalCity: string;
        bookingCount: number;
        totalRevenue: number;
      }>
    >`
      SELECT 
        dep.iataCode as departureCode,
        arr.iataCode as arrivalCode,
        dep.city as departureCity,
        arr.city as arrivalCity,
        COUNT(b.id) as bookingCount,
        SUM(p.amount) as totalRevenue
      FROM Booking b
      JOIN BookingItem bi ON b.id = bi.bookingId
      JOIN FlightSeat fs ON bi.itemRefId = fs.id
      JOIN Flight f ON fs.flightId = f.id
      JOIN Airport dep ON f.departureAirportId = dep.id
      JOIN Airport arr ON f.arrivalAirportId = arr.id
      JOIN Payment p ON b.id = p.bookingId
      WHERE b.status IN ('CONFIRMED', 'COMPLETED') AND p.status = 'SUCCESS'
      GROUP BY dep.iataCode, arr.iataCode, dep.city, arr.city
      ORDER BY bookingCount DESC
      LIMIT ${limit}
    `;

    return routes.map((r) => ({
      route: `${r.departureCode} → ${r.arrivalCode}`,
      departureCode: r.departureCode,
      arrivalCode: r.arrivalCode,
      departureCity: r.departureCity,
      arrivalCity: r.arrivalCity,
      bookingCount: Number(r.bookingCount),
      totalRevenue: Number(r.totalRevenue || 0),
    }));
  }

  /**
   * Refund analytics.
   */
  async getRefunds() {
    const [total, byStatus, totalAmount] = await Promise.all([
      this.prisma.extended.refund.count(),

      this.prisma.extended.refund.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true },
      }),

      this.prisma.extended.refund.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      totalApprovedAmount: Number(totalAmount._sum.amount || 0),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
        totalAmount: Number(s._sum.amount || 0),
      })),
    };
  }

  /**
   * Membership analytics — tier distribution.
   */
  async getMembership() {
    const tiers = await this.prisma.extended.membershipTier.findMany({
      orderBy: { minPoints: 'asc' },
    });

    // BE-039 fix: Use groupBy to avoid N+1 queries
    const pointsByTier = await this.prisma.extended.userPoints.groupBy({
      by: ['tierId'],
      _count: true,
    });
    const countsMap = new Map(pointsByTier.map(t => [t.tierId ? t.tierId.toString() : 'null', t._count]));

    const tierStats = tiers.map((tier) => ({
      tierId: tier.id.toString(),
      tierName: tier.name,
      minPoints: tier.minPoints,
      userCount: countsMap.get(tier.id.toString()) || 0,
    }));

    const totalWithPoints = await this.prisma.extended.userPoints.count({
      where: { pointsBalance: { gt: 0 } },
    });

    const avgPoints = await this.prisma.extended.userPoints.aggregate({
      _avg: { pointsBalance: true },
    });

    return {
      tiers: tierStats,
      totalWithPoints,
      avgPoints: Math.round(Number(avgPoints._avg.pointsBalance || 0)),
    };
  }

  /**
   * KPI summary — for the dashboard overview cards.
   */
  async getKpiSummary() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      totalBookings,
      bookingsToday,
      totalUsers,
      newUsersThisMonth,
      pendingRefunds,
    ] = await Promise.all([
      this.prisma.extended.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.extended.payment.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.extended.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
      this.prisma.extended.booking.count(),
      this.prisma.extended.booking.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.extended.user.count({ where: { deletedAt: null } }),
      this.prisma.extended.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.extended.refund.count({ where: { status: 'REQUESTED' } }),
    ]);

    const monthRevenue = Number((revenueThisMonth._sum as any)?.amount || 0);
    const lastMonthRevenue = Number(
      (revenueLastMonth._sum as any)?.amount || 0,
    );
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
          )
        : 100;

    return {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      revenueThisMonth: monthRevenue,
      revenueGrowthPercent: revenueGrowth,
      totalBookings,
      bookingsToday,
      totalUsers,
      newUsersThisMonth,
      pendingRefunds,
    };
  }

  // ===== Private helpers =====

  private getPeriodConfig(period: string) {
    const now = new Date();
    switch (period) {
      case 'day':
        return {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          groupFormat: '%Y-%m-%d %H:00',
        };
      case 'week':
        return {
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          groupFormat: '%Y-%m-%d',
        };
      case 'year':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          groupFormat: '%Y-%m',
        };
      case 'month':
      default:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          groupFormat: '%Y-%m-%d',
        };
    }
  }
}
