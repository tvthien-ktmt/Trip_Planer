'use client';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function BookingDetail() {
  const navigate = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleUpdate = () => {
    toast.success('Đã cập nhật trạng thái đặt chỗ');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate.back()} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết đặt chỗ: <span className="text-blue-600">{id}</span></h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Thông tin chuyến bay</h3>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white">SGN</p>
                <p className="text-sm text-gray-500">10:00 - 20/10/2026</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-blue-600">VN210</p>
                <div className="w-32 h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                <p className="text-xs text-gray-500">Vietnam Airlines</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white">HAN</p>
                <p className="text-sm text-gray-500">12:10 - 20/10/2026</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Hành khách</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">1. NGUYEN VAN A (Người lớn)</p>
                  <p className="text-sm text-gray-500">Hành lý: 20kg • Suất ăn: Cơm gà</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">Ghế: 12A</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Thanh toán</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex justify-between"><span>Giá vé</span><span>1,500,000 ₫</span></div>
              <div className="flex justify-between"><span>Thuế phí</span><span>450,000 ₫</span></div>
              <div className="flex justify-between"><span>Dịch vụ thêm</span><span>200,000 ₫</span></div>
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>Tổng cộng</span><span className="text-blue-600">2,150,000 ₫</span>
              </div>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-6">Cập nhật trạng thái</label>
            <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white mb-4">
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <button onClick={handleUpdate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
              <Save className="w-5 h-5" /> Lưu cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
