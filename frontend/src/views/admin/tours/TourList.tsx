import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function TourList() {
  const navigate = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // R5-FE-005 fix: Fetch real tours from BE
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/tours');
      const data = res.data?.data || res.data || [];
      setTours(data.map((t: any) => ({
        id: String(t.id),
        title: t.title || 'N/A',
        duration: t.durationDays ? `${t.durationDays} ngày ${t.durationNights} đêm` : 'N/A',
        price: t.basePrice || 0,
        status: t.status || 'ACTIVE'
      })));
    } catch (e) {
      toast.error('Không thể tải danh sách tour');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, []);

  const handleDelete = (id: string) => {
    toast.warning('Bạn có chắc chắn muốn xóa tour này?', {
      action: {
        label: 'Đồng ý',
        onClick: async () => {
          try {
            await api.delete(`/admin/tours/${id}`);
            toast.success('Đã xóa tour thành công');
            fetchTours();
          } catch (e) {
            toast.error('Xóa tour thất bại');
          }
        }
      },
      cancel: { label: 'Hủy', onClick: () => {} }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Tours & Trải nghiệm</h1>
        <button 
          onClick={() => navigate.push('/admin/tours/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Thêm Tour mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm Tên tour, ID..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">ID</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Tên Tour</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Thời lượng</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Giá (VND)</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Trạng thái</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tours.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold text-gray-500">{t.id}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{t.title}</td>
                  <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{t.duration}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{t.price.toLocaleString()} ₫</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => navigate.push(`/admin/tours/edit/${t.id}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
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
