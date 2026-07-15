import { Users, Ticket, Plane, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Doanh thu hôm nay", value: "124,500,000 ₫", trend: "+15%", isUp: true, icon: DollarSign, iconBg: "rgba(20,20,22,0.10)", iconColor: "var(--color-ocean-900)" },
    { title: "Vé đã bán", value: "432", trend: "+5%", isUp: true, icon: Ticket, iconBg: "rgba(59,113,254,0.12)", iconColor: "var(--color-ocean-600)" },
    { title: "Khách hàng mới", value: "128", trend: "-2%", isUp: false, icon: Users, iconBg: "rgba(232,163,61,0.12)", iconColor: "var(--color-lantern-500)" },
    { title: "Chuyến bay hoạt động", value: "45", trend: "0%", isUp: true, icon: Plane, iconBg: "rgba(240,101,74,0.10)", iconColor: "var(--color-coral-500)" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-[var(--text-primary)]"
          style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
          Tổng quan hệ thống
        </h1>
        <p className="text-[var(--text-secondary)] mt-1" style={{ fontSize: "var(--text-body)" }}>
          Cập nhật tình hình hoạt động và doanh thu hôm nay.
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-[var(--spacing-space-5)]">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-[var(--radius-radius-md)] p-5"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full flex-shrink-0" style={{ background: stat.iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: "var(--text-caption)" }}>{stat.title}</p>
                  <p className="font-display font-bold text-[var(--text-primary)] mt-1 mb-1"
                    style={{ fontSize: "var(--text-display-md)", lineHeight: 1.1 }}>
                    {stat.value}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: stat.isUp ? "var(--color-ocean-600)" : "var(--color-danger)" }}>
                    {stat.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {stat.trend} so với hôm qua
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-[var(--spacing-space-5)]">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-[var(--radius-radius-md)] p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
          <h2 className="font-semibold text-[var(--text-primary)] mb-6" style={{ fontSize: "var(--text-heading)" }}>
            Biểu đồ doanh thu 7 ngày qua
          </h2>
          <div className="h-64 flex items-end justify-between gap-4">
            {[40, 60, 45, 80, 50, 90, 75].map((val, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--radius-radius-sm)] px-2 py-1 text-xs text-white pointer-events-none"
                  style={{ background: "var(--color-ink-900)" }}>
                  {val}M ₫
                </div>
                <div className="w-full rounded-t-[var(--radius-radius-sm)] transition-all duration-300" 
                  style={{ background: "var(--color-ocean-900)", height: `${val}%` }} />
                <span className="text-[var(--text-secondary)] font-utility text-xs">T{i+2}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Bookings */}
        <div className="rounded-[var(--radius-radius-md)] p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
          <h2 className="font-semibold text-[var(--text-primary)] mb-6" style={{ fontSize: "var(--text-heading)" }}>
            Đặt vé gần đây
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center pb-4 last:border-0 last:pb-0"
                style={{ borderBottom: "1px solid var(--border-main)" }}>
                <div>
                  <p className="font-utility font-bold text-[var(--text-primary)] text-sm mb-0.5">VN8A2{i}</p>
                  <p className="text-[var(--text-secondary)] text-xs">Nguyễn Văn A – SGN ✈ HAN</p>
                </div>
                <span className="px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "var(--color-mist-50)", color: "var(--color-ocean-600)" }}>
                  Thành công
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
