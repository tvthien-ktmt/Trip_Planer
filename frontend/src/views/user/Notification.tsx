'use client';
import { Bell, Info, AlertTriangle, Gift, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Notification() {
  const [filter, setFilter] = useState('all');

  const notifications = [
    { id: 1, type: 'system', title: 'Cập nhật hệ thống', desc: 'Bảo trì hệ thống vào 02:00 sáng ngày mai.', time: '2 giờ trước', isRead: false },
    { id: 2, type: 'booking', title: 'Đặt vé thành công', desc: 'Vé máy bay VN8A2B đi Hà Nội đã được xác nhận.', time: '1 ngày trước', isRead: true },
    { id: 3, type: 'promo', title: 'Khuyến mãi đặc biệt', desc: 'Giảm 20% cho chuyến bay nội địa tuần này.', time: '3 ngày trước', isRead: true },
    { id: 4, type: 'alert', title: 'Đổi giờ bay', desc: 'Chuyến bay VN210 đổi giờ khởi hành sang 10:30.', time: '1 tuần trước', isRead: true },
  ];

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const getIcon = (type: string) => {
    switch(type) {
      case 'system': return <Info className="w-5 h-5 text-blue-500" />;
      case 'booking': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'promo': return <Gift className="w-5 h-5 text-purple-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông báo</h1>
        <button className="text-sm font-medium text-blue-600 hover:underline">Đánh dấu tất cả đã đọc</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'booking', 'promo', 'system', 'alert'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'booking' ? 'Đặt vé' : f === 'promo' ? 'Khuyến mãi' : f === 'system' ? 'Hệ thống' : 'Cảnh báo'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {filtered.map(item => (
          <div key={item.id} className={`p-4 flex gap-4 ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
            <div className="mt-1 shrink-0">{getIcon(item.type)}</div>
            <div className="flex-1">
              <h3 className={`text-sm ${!item.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              <p className="text-xs text-gray-500 mt-2">{item.time}</p>
            </div>
            {!item.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Không có thông báo nào.
          </div>
        )}
      </div>
    </div>
  );
}
