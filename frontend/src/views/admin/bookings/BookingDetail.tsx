import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function BookingDetail() {
  const navigate = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('PENDING_PAYMENT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/admin/bookings/${id}`);
        const data = res.data?.data || res.data;
        setBooking(data);
        setStatus(data?.status || 'PENDING_PAYMENT');
      } catch (error) {
        toast.error('Không tìm thấy đặt chỗ');
        navigate.push('/admin/bookings');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id, navigate]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      // R5-FE-005 fix: Use real API to update status instead of toast-only mock
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success('Đã cập nhật trạng thái đặt chỗ');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải chi tiết đặt chỗ...</div>;
  if (!booking) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate.back()} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết đặt chỗ: <span className="text-blue-600">{booking.bookingCode || id}</span></h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Thông tin dịch vụ</h3>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              {booking.flight ? (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{booking.flight.departure}</p>
                    <p className="text-sm text-gray-500">{new Date(booking.flight.departureTime).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="flex flex-col items-center mx-4">
                    <p className="text-sm font-bold text-blue-600">{booking.flight.flightNumber}</p>
                    <div className="w-32 h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{booking.flight.destination}</p>
                    <p className="text-sm text-gray-500">{new Date(booking.flight.arrivalTime).toLocaleString('vi-VN')}</p>
                  </div>
                </>
              ) : booking.tour ? (
                <div className="w-full">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{booking.tour.title}</p>
                  <p className="text-sm text-gray-500">{booking.tour.durationDays} ngày {booking.tour.durationNights} đêm</p>
                </div>
              ) : (
                <div className="w-full text-center text-gray-500">Dịch vụ không xác định</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Thông tin liên hệ & Hành khách</h3>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Email liên hệ: <span className="font-normal">{booking.contactEmail || booking.user?.email}</span></p>
                <p className="font-bold text-gray-900 dark:text-white">Số điện thoại: <span className="font-normal">{booking.contactPhone || booking.user?.phone}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Thanh toán</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <span>Tổng cộng</span><span className="text-blue-600">{(booking.totalAmount || 0).toLocaleString()} ₫</span>
              </div>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-6">Cập nhật trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white mb-4">
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            
            <button onClick={handleUpdate} disabled={isSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-5 h-5" /> {isSubmitting ? 'Đang cập nhật...' : 'Lưu cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
