import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Phân tích dữ liệu (Analytics)
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Tổng quan về lưu lượng truy cập và hành vi người dùng</p>
        </div>
        <select className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]">
          <option>30 ngày qua</option>
          <option>7 ngày qua</option>
          <option>Tháng này</option>
          <option>Năm nay</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        {[
          { label: 'Tổng lượt truy cập', value: '124,592', trend: '+12.5%', icon: Activity, color: 'var(--color-ocean-600)', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Người dùng mới', value: '8,234', trend: '+5.2%', icon: Users, color: 'var(--color-lantern-500)', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Tỷ lệ chuyển đổi', value: '3.8%', trend: '+1.1%', icon: TrendingUp, color: 'var(--color-coral-500)', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Doanh thu ước tính', value: '4.2B ₫', trend: '+15.3%', icon: DollarSign, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-4 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {stat.trend} so với kỳ trước
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder for Charts */}
        <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Lưu lượng truy cập theo ngày</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border-main)] rounded-lg bg-[var(--bg-main)]">
            <p className="text-[var(--text-secondary)] flex items-center gap-2"><Activity className="w-5 h-5" /> Biểu đồ đường (Line Chart Area)</p>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Nguồn truy cập (Traffic Sources)</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border-main)] rounded-lg bg-[var(--bg-main)]">
            <p className="text-[var(--text-secondary)] flex items-center gap-2"><Users className="w-5 h-5" /> Biểu đồ tròn (Pie Chart Area)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
