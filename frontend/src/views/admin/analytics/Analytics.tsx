'use client';
import { TrendingUp, Users, DollarSign, Activity, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../stores';

export default function Analytics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/admin/analytics/kpi?period=${period}`);
        setStats(res.data?.data || res.data);
      } catch (e) {
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, [period]);

  const periodLabel: Record<string, string> = {
    '7d': '7 ngày qua',
    '30d': '30 ngày qua',
    'month': 'Tháng này',
    'year': 'Năm nay',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Phân tích dữ liệu (Analytics)
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Tổng quan về lưu lượng truy cập và hành vi người dùng</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]"
        >
          {Object.entries(periodLabel).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tổng đặt chỗ', value: stats?.totalBookings?.toLocaleString('vi-VN') || '—', trend: stats?.bookingsToday ? `+${stats.bookingsToday} hôm nay` : '—', icon: Activity, color: 'var(--color-ocean-600)', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Người dùng', value: stats?.totalUsers?.toLocaleString('vi-VN') || '—', trend: stats?.newUsersThisMonth ? `+${stats.newUsersThisMonth} tháng này` : '—', icon: Users, color: 'var(--color-lantern-500)', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Hoàn tiền chờ', value: stats?.pendingRefunds?.toLocaleString('vi-VN') || '0', trend: '—', icon: TrendingUp, color: 'var(--color-coral-500)', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Doanh thu', value: stats?.totalRevenue ? `${(Number(stats.totalRevenue) / 1e9).toFixed(1)}B ₫` : '—', trend: stats?.revenueGrowthPercent ? `${stats.revenueGrowthPercent > 0 ? '+' : ''}${stats.revenueGrowthPercent}% tháng này` : '—', icon: DollarSign, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                    <h3 className="text-2xl font-bold font-display text-[var(--text-primary)] mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg}`} style={{ color: stat.color }}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                {stat.trend !== '—' && (
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-4 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {stat.trend} so với kỳ trước
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm min-h-[300px] flex flex-col">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Dữ liệu đặt vé theo ngày</h3>
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border-main)] rounded-lg bg-[var(--bg-main)]">
                <p className="text-[var(--text-secondary)] flex items-center gap-2"><Activity className="w-5 h-5" /> {stats?.totalBookings ? `${stats.totalBookings} đặt chỗ trong kỳ` : 'Không có dữ liệu'}</p>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm min-h-[300px] flex flex-col">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Phân bổ người dùng</h3>
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border-main)] rounded-lg bg-[var(--bg-main)]">
                <p className="text-[var(--text-secondary)] flex items-center gap-2"><Users className="w-5 h-5" /> {stats?.totalUsers ? `${stats.totalUsers} người dùng tổng` : 'Không có dữ liệu'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
