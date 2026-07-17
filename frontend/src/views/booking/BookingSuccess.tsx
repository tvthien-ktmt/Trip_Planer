'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { CheckCircle2, Download, Eye } from 'lucide-react';

export default function BookingSuccess() {
  const navigate = useRouter();
  const { setStep, resetBooking } = useBookingFlowStore();

  useEffect(() => {
    setStep(8);
    // Tự động clear sau khi rời khỏi trang
    return () => resetBooking();
  }, [setStep, resetBooking]);

  return (
    <div className="max-w-2xl mx-auto text-center mt-12">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Đặt vé thành công!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Mã đặt chỗ của bạn là:
      </p>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl mb-8 border border-gray-200 dark:border-gray-700">
        <div className="text-4xl font-black text-blue-600 tracking-[0.5em] mb-2">
          VN8A2B
        </div>
        <p className="text-sm text-gray-500">Vui lòng lưu lại mã này để làm thủ tục chuyến bay</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={() => navigate.push('/booking/ticket/NEWPNR')}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
        >
          <Download className="w-5 h-5" /> Tải e-Ticket
        </button>
        <button 
          onClick={() => navigate.push('/user/bookings/VN8A2B')}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold"
        >
          <Eye className="w-5 h-5" /> Xem chi tiết
        </button>
      </div>
    </div>
  );
}
