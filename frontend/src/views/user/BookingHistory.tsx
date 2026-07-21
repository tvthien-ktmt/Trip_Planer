'use client';
import { useState, useEffect } from 'react';
import { Plane, Calendar, Eye, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { routes } from '../../lib/routes';
import { api } from '../../lib/api';

export default function BookingHistory() {
  const [filter, setFilter] = useState('upcoming');
  const navigate = useRouter();

  // R5-FE-016 fix: Fetch real bookings from BE instead of hardcoded array
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/bookings/my');
        const data = res.data?.data || res.data || [];
        setBookings(data.map((b: any) => ({
          id: b.bookingCode || b.id,
          status: b.status === 'CONFIRMED' ? 'upcoming' : b.status === 'COMPLETED' ? 'completed' : b.status === 'CANCELLED' ? 'cancelled' : 'upcoming',
          from: b.departure || 'N/A',
          to: b.destination || 'N/A',
          date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '',
          time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
          airline: b.airline || 'Trip Planner',
          price: b.totalAmount || 0,
        })));
      } catch (e) {
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const filtered = bookings.filter(b => b.status === filter);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chuyến bay của tôi</h1>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'upcoming', label: 'Sắp tới' },
          { id: 'completed', label: 'Đã hoàn thành' },
          { id: 'cancelled', label: 'Đã hủy' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-3 font-bold text-sm transition-colors relative ${
              filter === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {filter === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(booking => (
          <div key={booking.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">PNR: {booking.id}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  booking.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                  booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {booking.status === 'upcoming' ? 'Đã xác nhận' : booking.status === 'completed' ? 'Đã bay' : 'Đã hủy'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{booking.from}</p>
                </div>
                <div className="flex-1 max-w-[100px] flex flex-col items-center">
                  <div className="w-full h-px bg-gray-300 dark:bg-gray-600 relative flex justify-center">
                    <Plane className="w-4 h-4 text-gray-400 absolute -top-2" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{booking.to}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {booking.date} • {booking.time}</span>
                <span>{booking.airline}</span>
              </div>
            </div>

            <div className="flex md:flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6 shrink-0">
              <p className="text-xl font-bold text-blue-600">{booking.price.toLocaleString()} ₫</p>
              <div className="flex gap-2">
                {booking.status === 'upcoming' && (
                  <button onClick={() => navigate.push(routes.bookingTicket(booking.id.toString()))} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Tải vé">
                    <FileText className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => navigate.push(`/user/bookings/${booking.id}`)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold rounded-lg transition-colors">
                  <Eye className="w-4 h-4" /> Chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Bạn chưa có chuyến bay nào.</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 font-bold hover:underline">Tìm chuyến bay ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
}
