'use client';
import { Ticket, Star, BellRing, PlaneTakeoff, TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { RouteLine } from "../../components/ui/RouteLine";
import { useAuthStore } from "../../stores";
import { api } from "../../lib/api";

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: { value: string; up: boolean };
  iconBg: string;
  iconColor: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, label, value, trend, iconBg, iconColor }) => (
  <div className="relative rounded-[var(--radius-radius-md)] p-5 overflow-hidden"
    style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
    <div className="absolute top-0 right-0 w-32 h-12 opacity-5 pointer-events-none" aria-hidden="true">
      <RouteLine variant="card" color="var(--color-ocean-900)" />
    </div>

    <div className="flex items-center gap-4">
      <div className="p-3 rounded-[var(--radius-radius-sm)] flex-shrink-0"
        style={{ background: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[var(--text-secondary)]" style={{ fontSize: "var(--text-caption)" }}>{label}</p>
        <p className="font-display font-bold text-[var(--text-primary)]"
          style={{ fontSize: "var(--text-display-md)", lineHeight: 1.1 }}>
          {value}
        </p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.up ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--color-ocean-600)" }} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" style={{ color: "var(--color-danger)" }} />
            )}
            <span className="text-xs font-medium"
              style={{ color: trend.up ? "var(--color-ocean-600)" : "var(--color-danger)" }}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState<any>(null);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [kpiRes, bookingsRes] = await Promise.all([
          api.get('/users/me/stats'),
          api.get('/bookings/my?status=CONFIRMED&limit=1'),
        ]);
        setKpis(kpiRes.data?.data || kpiRes.data);
        const bookings = bookingsRes.data?.data || bookingsRes.data || [];
        setUpcomingBooking(Array.isArray(bookings) ? bookings[0] : null);
      } catch (e) {
        setKpis(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-semibold text-[var(--text-primary)]"
          style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
          Xin chào, {user?.name?.split(" ").pop() || "bạn"} 👋
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Đây là tổng quan tài khoản của bạn.</p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-[var(--spacing-space-5)]">
          <KpiCard
            icon={PlaneTakeoff}
            label="Chuyến bay sắp tới"
            value={String(kpis?.upcomingFlights ?? '—')}
            iconBg="rgba(20,20,22,0.10)"
            iconColor="var(--color-ocean-900)"
          />
          <KpiCard
            icon={Star}
            label="Điểm thành viên"
            value={kpis?.points ? kpis.points.toLocaleString('vi-VN') : '—'}
            iconBg="rgba(232,163,61,0.12)"
            iconColor="var(--color-lantern-500)"
          />
          <KpiCard
            icon={Ticket}
            label="Đã đặt vé"
            value={String(kpis?.totalBookings ?? '—')}
            iconBg="rgba(59,113,254,0.12)"
            iconColor="var(--color-ocean-600)"
          />
          <KpiCard
            icon={BellRing}
            label="Thông báo mới"
            value={String(kpis?.unreadNotifications ?? '—')}
            iconBg="rgba(240,101,74,0.10)"
            iconColor="var(--color-coral-500)"
          />
        </div>
      )}

      {/* Upcoming flight card */}
      <div className="rounded-[var(--radius-radius-md)] p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-[var(--text-primary)]"
            style={{ fontSize: "var(--text-heading)" }}>Chuyến bay sắp tới</h2>
          <Link href="/user/bookings"
            className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-custom"
            style={{ color: "var(--color-ocean-600)" }}>
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBooking ? (
          <div className="p-4 rounded-[var(--radius-radius-sm)]"
            style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-3">
                  <div className="text-center">
                    <p className="font-utility text-2xl font-bold text-[var(--text-primary)]">{upcomingBooking.departure || 'N/A'}</p>
                    <p className="font-utility text-sm text-[var(--text-secondary)] mt-0.5">{upcomingBooking.departureTime || ''}</p>
                  </div>
                  <div className="flex-1 px-4">
                    <RouteLine variant="card" color="var(--color-ocean-600)" />
                  </div>
                  <div className="text-center">
                    <p className="font-utility text-2xl font-bold text-[var(--text-primary)]">{upcomingBooking.destination || 'N/A'}</p>
                    <p className="font-utility text-sm text-[var(--text-secondary)] mt-0.5">{upcomingBooking.arrivalTime || ''}</p>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: "var(--text-caption)" }}>
                  {upcomingBooking.airline || ''} • {upcomingBooking.bookingCode || ''}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(59,113,254,0.12)", color: "var(--color-ocean-600)" }}>
                  ✓ Đã xác nhận
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-main)] rounded-xl">
            <PlaneTakeoff className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Bạn chưa có chuyến bay nào sắp tới.</p>
            <Link href="/" className="text-sm font-semibold mt-2 inline-block" style={{ color: "var(--color-ocean-600)" }}>Tìm chuyến bay</Link>
          </div>
        )}
      </div>
    </div>
  );
}
