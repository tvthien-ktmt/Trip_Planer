import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function TourCreate() {
  const navigate = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    locationId: '1',
    durationDays: '',
    durationNights: '',
    basePrice: '',
    categoryId: '1',
    coverImage: '',
    description: '',
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // R5-FE-005 fix: POST real data to BE instead of toast-only mock
      const payload = {
        ...formData,
        locationId: BigInt(formData.locationId),
        categoryId: BigInt(formData.categoryId),
        durationDays: Number(formData.durationDays),
        durationNights: Number(formData.durationNights),
        basePrice: Number(formData.basePrice)
      };
      await api.post('/admin/tours', payload);
      toast.success('Đã thêm tour mới!');
      navigate.push('/admin/tours');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="VD: Tour Khám phá Vịnh Hạ Long" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa điểm (ID)</label>
            <input type="number" name="locationId" value={formData.locationId} onChange={handleChange} placeholder="VD: 1" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số ngày</label>
              <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} placeholder="3" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số đêm</label>
              <input type="number" name="durationNights" value={formData.durationNights} onChange={handleChange} placeholder="2" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá (VND)</label>
            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="VD: 2500000" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chuyên mục (ID)</label>
            <input type="number" name="categoryId" value={formData.categoryId} onChange={handleChange} placeholder="1" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL Hình ảnh Cover</label>
            <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://..." className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả chi tiết</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Nhập nội dung chi tiết..." className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" /> {isSubmitting ? 'Đang lưu...' : 'Lưu Tour'}
          </button>
        </div>
      </form>
    </div>
  );
}
