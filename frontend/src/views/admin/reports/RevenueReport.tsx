import { useEffect, useState } from 'react';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../../lib/api';

export default function RevenueReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics/revenue?period=month')
      .then(res => {
        setData(res.data?.data || res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-blue-600 animate-pulse">Đang tải báo cáo doanh thu...</div>;

  const totalRev = data.totalRevenue || 0;
  const periodRev = data.periodRevenue || 0;
  const trendData = data.trend || [];
  
  // Find max revenue for chart scaling
  const maxRev = trendData.length > 0 ? Math.max(...trendData.map((t: any) => t.revenue)) : 1;

  // We split total into some fake categories for the UI if BE doesn't provide them, 
  // but let's just show total, period, and maybe method breakdown since BE has methodBreakdown.
  const cards = [
    { title: 'Tổng doanh thu', value: totalRev, label: 'Tất cả thời gian' },
    { title: 'Doanh thu tháng này', value: periodRev, label: '30 ngày qua' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Báo cáo Doanh thu</h1>
          <p className="text-gray-500 mt-1">Phân tích chi tiết doanh thu theo tháng</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="w-5 h-5" /> Tháng này
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
            <Download className="w-5 h-5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{card.value.toLocaleString()} ₫</p>
            <div className="mt-4 flex items-center text-sm font-bold text-gray-500 w-fit px-2 py-1 rounded-md">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Biểu đồ doanh thu 30 ngày qua</h2>
        <div className="h-80 flex items-end justify-between gap-2 overflow-x-auto">
          {trendData.length > 0 ? trendData.map((val: any, i: number) => {
            const heightPct = Math.max((val.revenue / maxRev) * 100, 2);
            return (
              <div key={i} className="w-full min-w-[20px] flex flex-col items-center gap-2 relative group cursor-pointer">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {val.revenue.toLocaleString()} ₫
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative">
                  <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500" style={{ height: `${heightPct}%` }}></div>
                </div>
                <span className="text-[10px] text-gray-400 rotate-45 mt-2">{val.date.split('-').pop()}</span>
              </div>
            );
          }) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Không có dữ liệu</div>
          )}
        </div>
      </div>
      
      {data.methodBreakdown && data.methodBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Phương thức thanh toán</h2>
          <div className="space-y-4">
            {data.methodBreakdown.map((m: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{m.method}</p>
                  <p className="text-sm text-gray-500">{m.count} giao dịch</p>
                </div>
                <p className="font-bold text-blue-600">{m.revenue.toLocaleString()} ₫</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
