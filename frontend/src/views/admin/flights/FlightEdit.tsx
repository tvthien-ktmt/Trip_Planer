'use client';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter , useParams} from 'next/navigation';
import { toast } from 'sonner';

export default function FlightEdit() {
  const navigate = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã cập nhật chuyến bay!');
    navigate.push('/admin/flights');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate.back()} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cập nhật chuyến bay {id}</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mã chuyến bay (Số hiệu)</label>
            <input type="text" defaultValue={id} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hãng hàng không</label>
            <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option>Vietnam Airlines</option>
              <option>Vietjet Air</option>
              <option>Bamboo Airways</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Điểm đi</label>
            <input type="text" defaultValue="SGN" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Điểm đến</label>
            <input type="text" defaultValue="HAN" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày bay</label>
            <input type="date" defaultValue="2026-10-20" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giờ cất cánh</label>
            <input type="time" defaultValue="10:00" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá cơ bản (VND)</label>
            <input type="number" defaultValue={1500000} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
            <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="active">Hoạt động</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
            <Save className="w-5 h-5" /> Cập nhật chuyến bay
          </button>
        </div>
      </form>
    </div>
  );
}
