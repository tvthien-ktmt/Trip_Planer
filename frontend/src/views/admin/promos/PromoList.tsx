'use client';
import { Plus, Search, Edit2, Trash2, Tag, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

interface Promo {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
}

export default function PromoList() {
  const navigate = useRouter();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/promos', { params: { search: searchTerm || undefined } });
      const data = res.data?.data || res.data || [];
      setPromos(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { fetchPromos(); }, []);

  const handleDelete = (promoId: string) => {
    toast.warning('Bạn có chắc chắn muốn xóa khuyến mãi này?', {
      action: {
        label: 'Đồng ý',
        onClick: async () => {
          try {
            await api.delete(`/admin/promos/${promoId}`);
            toast.success('Đã xóa khuyến mãi thành công');
            fetchPromos();
          } catch {
            toast.error('Không thể xóa khuyến mãi');
          }
        }
      },
      cancel: { label: 'Hủy', onClick: () => {} }
    });
  };

  const isExpired = (validTo: string) => new Date(validTo) < new Date();
  const formatDiscount = (p: Promo) => p.discountType === 'PERCENT'
    ? `${p.discountValue}%`
    : `${Number(p.discountValue).toLocaleString('vi-VN')} ₫`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Khuyến mãi</h1>
        <div className="flex gap-2">
          <button onClick={fetchPromos} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate.push('/admin/promos/create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Thêm khuyến mãi
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mã Code, Tên chương trình..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPromos()}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={fetchPromos} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">
            Tìm
          </button>
        </div>

        {error && (
          <div className="p-4 text-red-500 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Mã Code</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Chương trình</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Loại</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Giá trị</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Hạn sử dụng</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Đã dùng</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm">Trạng thái</th>
                <th className="p-4 font-bold text-gray-900 dark:text-white text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading
                ? [1, 2, 3].map(i => (
                    <tr key={i}>
                      <td colSpan={8} className="p-4"><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                : promos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <span className="flex items-center gap-1 font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit">
                          <Tag className="w-3 h-3" /> {p.code}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{p.description || '—'}</td>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-400">
                        {p.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
                      </td>
                      <td className="p-4 font-bold text-blue-600">{formatDiscount(p)}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(p.validTo).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {p.usedCount}{p.usageLimit ? `/${p.usageLimit}` : ''}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          isExpired(p.validTo) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {isExpired(p.validTo) ? 'Hết hạn' : 'Đang hoạt động'}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              {!loading && promos.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">Không có khuyến mãi nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
