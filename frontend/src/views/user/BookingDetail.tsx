'use client';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit3, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingDetail() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useRouter();

  const handleCancel = () => {
    toast.success('Yêu cầu hủy vé đã được gửi. Chúng tôi sẽ xử lý sớm nhất.');
  };

  const handleChange = () => {
    toast.info('Tính năng đổi chuyến bay đang được cập nhật.');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết đặt chỗ</h1>
          <p className="text-gray-500 mt-1">Mã PNR: <span className="font-bold text-blue-600">{id || 'VN8A2B'}</span></p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-lg">Đã xác nhận</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Thông tin hành trình</h3>
        <div className="flex gap-6 items-center">
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900 dark:text-white">SGN</p>
            <p className="text-sm text-gray-500">10:00 - 20/10/2026</p>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-2 text-xs text-gray-500">VN210</span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900 dark:text-white">HAN</p>
            <p className="text-sm text-gray-500">12:10 - 20/10/2026</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 mb-1">Hành khách</p>
            <p className="font-bold text-gray-900 dark:text-white">NGUYEN VAN A</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Hạng vé</p>
            <p className="font-bold text-gray-900 dark:text-white">Phổ thông (Economy)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ghế ngồi</p>
            <p className="font-bold text-gray-900 dark:text-white">12A</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Hành lý</p>
            <p className="font-bold text-gray-900 dark:text-white">20kg Ký gửi</p>
          </div>
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
          <button onClick={() => navigate.push(`/user/refunds/${id}`)} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Clock className="w-6 h-6 text-orange-600 mb-2" />
            <span className="font-medium text-gray-900 dark:text-white">Tiến độ hoàn tiền</span>
          </button>
        </div>
      </div>
    </div>
  );
}
