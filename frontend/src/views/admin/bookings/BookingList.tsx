'use client';
import { Search, Eye, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookingList() {
  const navigate = useRouter();

  const bookings = [
    { id: 'VN8A2B', user: 'Nguyễn Văn A', email: 'nva@gmail.com', flight: 'VN210', date: '20/10/2026', total: 2150000, status: 'Confirmed' },
    { id: 'VJ9C4D', user: 'Trần Thị B', email: 'ttb@gmail.com', flight: 'VJ123', date: '21/10/2026', total: 1500000, status: 'Pending' },
    { id: 'QH2E1F', user: 'Lê Văn C', email: 'lvc@gmail.com', flight: 'QH456', date: '22/10/2026', total: 3200000, status: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Đặt chỗ</h1>
        <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-5 h-5" /> Bộ lọc
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm PNR, Tên khách hàng, Email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">PNR</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Khách hàng</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Chuyến bay</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Ngày đặt</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Tổng tiền</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Trạng thái</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold text-blue-600">{b.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 dark:text-white">{b.user}</p>
                    <p className="text-xs text-gray-500">{b.email}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{b.flight}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{b.date}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{b.total.toLocaleString()} ₫</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                      b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end">
                    <button onClick={() => navigate.push(`/admin/bookings/${b.id}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
