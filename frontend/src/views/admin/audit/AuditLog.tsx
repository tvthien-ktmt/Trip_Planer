'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShieldAlert, Edit, Trash, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../stores/authStore';
import { Skeleton } from '../../../components/common/Skeleton';

interface AuditLogEntry {
  id: string;
  action: string;
  targetType: string;
  adminUser?: { fullName: string; email: string };
  ipAddress?: string;
  createdAt: string;
  afterData?: any;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  DELETE: <Trash className="w-4 h-4 text-red-500" />,
  UPDATE: <Edit className="w-4 h-4 text-yellow-500" />,
  CREATE: <ShieldAlert className="w-4 h-4 text-green-500" />,
  LOGIN: <LogIn className="w-4 h-4 text-blue-500" />,
};

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load audit logs');
      const json = await res.json();
      setLogs(json.data || []);
      setTotalPages(json.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      (log.adminUser?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.adminUser?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.includes(searchTerm);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter.toUpperCase();
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Nhật ký hoạt động (Audit Log)
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Giám sát và truy vết các thao tác của quản trị viên hệ thống</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4" /> Làm mới
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Tìm theo user, hành động, IP..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
        >
          <option value="all">Tất cả hành động</option>
          <option value="delete">Xóa</option>
          <option value="update">Cập nhật</option>
          <option value="create">Tạo mới</option>
          <option value="login">Đăng nhập</option>
        </select>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                <th className="p-4 font-medium">Người dùng (Admin)</th>
                <th className="p-4 font-medium">Hành động</th>
                <th className="p-4 font-medium">Đối tượng tác động</th>
                <th className="p-4 font-medium">Địa chỉ IP</th>
                <th className="p-4 font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {loading
                ? [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td colSpan={5} className="p-4"><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                : filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--bg-main)] transition-colors">
                      <td className="p-4 font-medium text-[var(--text-primary)]">
                        <div>{log.adminUser?.fullName || '—'}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{log.adminUser?.email || ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {ACTION_ICONS[log.action] || <ShieldAlert className="w-4 h-4 text-gray-400" />}
                          <span className="text-[var(--text-primary)]">{log.action}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">{log.targetType}</td>
                      <td className="p-4 text-sm font-mono text-[var(--text-secondary)]">{log.ipAddress || '—'}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">Không có dữ liệu audit log</td>
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
