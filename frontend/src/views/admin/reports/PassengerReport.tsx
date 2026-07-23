import { Users, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export default function PassengerReport() {
  const [data, setData] = useState({
    totalPassengers: 0,
    seatDistribution: { economy: 0, business: 0, firstClass: 0 },
    history: []
  });

  useEffect(() => {
    api.get('/admin/analytics/passengers').then(res => {
      setData(res.data);
    }).catch(err => {
      console.error('Failed to load passenger stats', err);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Báo cáo Hành khách</h1>
          <p className="text-gray-500 mt-1">Thống kê lượng khách và xu hướng bay</p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-5 h-5" /> Năm nay
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tổng lượng khách</h2>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">{data.totalPassengers.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Người / Toàn thời gian</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tỷ lệ theo hạng ghế</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Phổ thông (Economy)</span>
                <span className="font-bold text-gray-900 dark:text-white">{data.seatDistribution.economy}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${data.seatDistribution.economy}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Thương gia (Business)</span>
                <span className="font-bold text-gray-900 dark:text-white">{data.seatDistribution.business}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${data.seatDistribution.business}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Hạng nhất (First Class)</span>
                <span className="font-bold text-gray-900 dark:text-white">{data.seatDistribution.firstClass}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${data.seatDistribution.firstClass}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
