'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Filter, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

interface Payment {
  id: string;
  method: string;
  amount: string | number;
  status: string;
  transactionRef?: string;
  createdAt: string;
  booking?: {
    bookingCode: string;
    user?: { fullName: string; email: string };
  };
}

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  SUCCESS: { label: 'Thành công', icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  PENDING: { label: 'Đang chờ', icon: <Clock className="w-3.5 h-3.5" />, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  FAILED: { label: 'Thất bại', icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  REFUNDED: { label: 'Hoàn tiền', icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-gray-100 text-gray-600' },
  EXPIRED: { label: 'Hết hạn', icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-gray-100 text-gray-500' },
};

export default function PaymentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/payments', {
        params: { page, limit: 20, status: statusFilter !== 'ALL' ? statusFilter : undefined },
      });
      const json = res.data;
      setPayments(json.data || []);
      setTotalPages(json.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filtered = searchTerm
    ? payments.filter(p =>
        p.transactionRef?.includes(searchTerm) ||
        p.booking?.bookingCode?.includes(searchTerm) ||
        p.booking?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : payments;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Quản lý Thanh toán
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Theo dõi và đối soát các giao dịch thanh toán</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={fetchPayments}>
          <RefreshCw className="w-4 h-4" /> Làm mới
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Tìm mã giao dịch, mã đặt chỗ, tên người dùng..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="SUCCESS">Thành công</option>
          <option value="PENDING">Đang chờ</option>
          <option value="FAILED">Thất bại</option>
          <option value="REFUNDED">Hoàn tiền</option>
          <option value="EXPIRED">Hết hạn</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 text-red-500">{error}</div>
      )}

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                <th className="p-4 font-medium">Mã GD</th>
                <th className="p-4 font-medium">Mã đặt chỗ</th>
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Số tiền</th>
                <th className="p-4 font-medium">Phương thức</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {loading
                ? [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td colSpan={7} className="p-4"><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                : filtered.map(payment => {
                    const s = STATUS_MAP[payment.status] || { label: payment.status, icon: null, className: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={payment.id} className="hover:bg-[var(--bg-main)] transition-colors">
                        <td className="p-4 font-medium text-[var(--color-ocean-600)] font-mono text-sm">
                          {payment.transactionRef || `#${payment.id}`}
                        </td>
                        <td className="p-4 text-[var(--text-primary)]">{payment.booking?.bookingCode || '—'}</td>
                        <td className="p-4 text-[var(--text-primary)]">
                          <div>{payment.booking?.user?.fullName || '—'}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{payment.booking?.user?.email || ''}</div>
                        </td>
                        <td className="p-4 font-semibold text-[var(--text-primary)]">
                          {Number(payment.amount).toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="p-4 text-[var(--text-secondary)]">{payment.method}</td>
                        <td className="p-4 text-[var(--text-secondary)] text-sm">
                          {new Date(payment.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.className}`}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              {!loading && filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">Không có giao dịch nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm transition-colors ${p === page
                ? 'bg-[var(--color-ocean-600)] text-white'
                : 'bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] hover:bg-[var(--bg-main)]'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
