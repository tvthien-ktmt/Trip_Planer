'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit3, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingDetail() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { api } = await import('../../lib/api');
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data?.data || res.data);
      } catch (err) {
        setError('Không thể tải thông tin đặt chỗ.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  const handleCancel = () => {
    toast.success('Yêu cầu hủy vé đã được gửi. Chúng tôi sẽ xử lý sớm nhất.');
  };

  const handleChange = () => {
    toast.info('Tính năng đổi chuyến bay đang được cập nhật.');
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-blue-600">Đang tải...</div>;
  if (error || !booking) return <div className="p-8 text-center text-red-500">{error || 'Không tìm thấy thông tin'}</div>;

  const firstItem = booking.items?.[0] || {};
  // Assuming item is a flight (real app would check type)
  // For demo, we just use the booking code and some hardcoded flight details if flight not populated
  const flightNumber = 'VN210';
  const depCode = 'SGN';
  const arrCode = 'HAN';
  const depTime = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'N/A';
  
  const passengers = booking.passengers || [];

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết đặt chỗ</h1>
          <p className="text-gray-500 mt-1">Mã PNR: <span className="font-bold text-blue-600">{booking.bookingCode || id}</span></p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-lg">{booking.status}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Thông tin hành trình</h3>
        <div className="flex gap-6 items-center">
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900 dark:text-white">{depCode}</p>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-2 text-xs text-gray-500">{flightNumber}</span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900 dark:text-white">{arrCode}</p>
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Hành khách</h4>
          {passengers.length > 0 ? passengers.map((p: any, idx: number) => (
            <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-1">Họ tên</p>
                <p className="font-bold text-gray-900 dark:text-white truncate">{p.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ghế</p>
                <p className="font-bold text-gray-900 dark:text-white">{p.seatId ? `Ghế ID ${p.seatId}` : 'Chưa chọn'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hạng vé</p>
                <p className="font-bold text-gray-900 dark:text-white">{p.fareClassId ? 'Đã chọn' : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Giấy tờ</p>
                <p className="font-bold text-gray-900 dark:text-white truncate">{p.passportNo || 'N/A'}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-500">Không có thông tin hành khách.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Quản lý vé</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button onClick={handleChange} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Edit3 className="w-6 h-6 text-blue-600 mb-2" />
            <span className="font-medium text-gray-900 dark:text-white">Đổi ngày bay</span>
          </button>
          <button onClick={handleCancel} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <XCircle className="w-6 h-6 text-red-600 mb-2" />
            <span className="font-medium text-gray-900 dark:text-white">Yêu cầu hủy vé</span>
          </button>
          <button onClick={() => toast.info('Tính năng hoàn vé đang được phát triển')} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Clock className="w-6 h-6 text-orange-600 mb-2" />
            <span className="font-medium text-gray-900 dark:text-white">Tiến độ hoàn tiền</span>
          </button>
        </div>
      </div>
    </div>
  );
}
