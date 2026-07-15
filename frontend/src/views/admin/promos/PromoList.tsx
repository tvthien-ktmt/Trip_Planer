import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PromoList() {
  const navigate = useRouter();

  const promos = [
    { id: 'SUMMER2026', title: 'Khuyến mãi mùa hè', type: 'Phần trăm', value: '20%', exp: '30/08/2026', status: 'Active' },
    { id: 'VN200K', title: 'Giảm giá vé nội địa', type: 'Cố định', value: '200,000 ₫', exp: '30/10/2026', status: 'Active' },
    { id: 'FREEBAG', title: 'Miễn phí hành lý', type: 'Dịch vụ', value: '20kg', exp: '01/01/2026', status: 'Expired' },
  ];

  const handleDelete = () => {
    if(window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      toast.success('Đã xóa khuyến mãi thành công');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Khuyến mãi</h1>
        <button 
          onClick={() => navigate.push('/admin/promos/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Thêm khuyến mãi
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã Code, Tên chương trình..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Mã Code</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Chương trình</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Loại</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Giá trị</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Hạn sử dụng</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Trạng thái</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {promos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <span className="flex items-center gap-1 font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit">
                      <Tag className="w-3 h-3" /> {p.id}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{p.title}</td>
                  <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{p.type}</td>
                  <td className="p-4 font-bold text-blue-600">{p.value}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{p.exp}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
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
