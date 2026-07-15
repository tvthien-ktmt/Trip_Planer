import { Download, Filter, TrendingUp } from 'lucide-react';

export default function RevenueReport() {
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tổng doanh thu vé</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">4.2B ₫</p>
          <div className="mt-4 flex items-center text-sm font-bold text-green-500 bg-green-50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-4 h-4 mr-1" /> +12.5% so với tháng trước
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Doanh thu dịch vụ (Hành lý/Suất ăn)</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">850M ₫</p>
          <div className="mt-4 flex items-center text-sm font-bold text-green-500 bg-green-50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-4 h-4 mr-1" /> +8.2% so với tháng trước
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Doanh thu Tour</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">1.5B ₫</p>
          <div className="mt-4 flex items-center text-sm font-bold text-green-500 bg-green-50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-4 h-4 mr-1" /> +15.3% so với tháng trước
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Biểu đồ doanh thu năm 2026</h2>
        <div className="h-80 flex items-end justify-between gap-4">
          {[30, 45, 40, 60, 55, 70, 65, 80, 75, 90, 85, 95].map((val, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500" style={{ height: `${val}%` }}></div>
              </div>
              <span className="text-xs font-medium text-gray-500">T{i+1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
