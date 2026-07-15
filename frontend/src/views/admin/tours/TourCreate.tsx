import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TourCreate() {
  const navigate = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã thêm tour mới!');
    navigate.push('/admin/tours');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate.back()} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo Tour / Bài viết mới</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiêu đề Tour/Bài viết</label>
          <input type="text" placeholder="VD: Tour Khám phá Vịnh Hạ Long" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa điểm</label>
            <input type="text" placeholder="VD: Hạ Long, Quảng Ninh" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời lượng</label>
            <input type="text" placeholder="VD: 3 ngày 2 đêm" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá (VND)</label>
            <input type="number" placeholder="VD: 2500000" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại hình</label>
            <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="tour">Tour Du lịch</option>
              <option value="activity">Hoạt động/Trải nghiệm</option>
              <option value="article">Bài viết Hướng dẫn</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL Hình ảnh Cover</label>
            <input type="url" placeholder="https://..." className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả chi tiết</label>
            <textarea rows={6} placeholder="Nhập nội dung chi tiết..." className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
            <Save className="w-5 h-5" /> Lưu nội dung
          </button>
        </div>
      </form>
    </div>
  );
}
