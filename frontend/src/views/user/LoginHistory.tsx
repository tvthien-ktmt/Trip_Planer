'use client';
import { Clock, MapPin, Monitor, Smartphone, Globe, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function LoginHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/auth/login-history');
        const data = res.data?.data || res.data || [];
        setHistory(data.map((h: any) => ({
          id: String(h.id),
          device: h.device || 'Unknown Device',
          browser: h.device?.includes('Chrome') ? 'Chrome' : h.device?.includes('Firefox') ? 'Firefox' : h.device?.includes('Safari') ? 'Safari' : 'Browser',
          os: h.device?.includes('Windows') ? 'Windows' : h.device?.includes('Mac') ? 'macOS' : h.device?.includes('Android') ? 'Android' : h.device?.includes('iOS') ? 'iOS' : 'Unknown OS',
          location: h.ipAddress || 'Unknown',
          ip: h.ipAddress || 'Unknown',
          time: h.loginAt ? new Date(h.loginAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          status: h.success ? 'success' : 'failed',
          type: h.device?.toLowerCase().includes('mobile') || h.device?.toLowerCase().includes('android') || h.device?.toLowerCase().includes('iphone') ? 'mobile' : 'desktop',
        })));
      } catch (e) {
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Lịch sử đăng nhập</h1>
          <p className="text-[var(--text-secondary)] mt-1">Theo dõi các hoạt động đăng nhập vào tài khoản của bạn</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                  <th className="p-4 font-medium">Thiết bị & Trình duyệt</th>
                  <th className="p-4 font-medium">Địa điểm & IP</th>
                  <th className="p-4 font-medium">Thời gian</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-main)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                          {log.type === 'desktop' ? <Monitor className="w-5 h-5" /> : log.type === 'mobile' ? <Smartphone className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{log.device}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{log.browser} • {log.os}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-primary)]">{log.location}</span>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] ml-6">{log.ip}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-primary)]">{log.time}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.status === 'current' && (
                        <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-medium">
                          Phiên hiện tại
                        </span>
                      )}
                      {log.status === 'success' && (
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-medium">
                          Thành công
                        </span>
                      )}
                      {log.status === 'failed' && (
                        <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-medium">
                          Thất bại
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Không có lịch sử đăng nhập.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
