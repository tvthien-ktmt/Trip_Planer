'use client';
import { Monitor, Smartphone, ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

export default function DeviceManagement() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/devices');
      const data = res.data?.data || res.data || [];
      setDevices(data.map((d: any) => ({
        id: String(d.id),
        name: d.deviceName || 'Unknown Device',
        os: d.deviceType || 'Unknown OS',
        browser: d.userAgent?.split(' ')?.[0] || 'Browser',
        lastActive: d.lastActiveAt ? new Date(d.lastActiveAt).toLocaleString('vi-VN') : 'Unknown',
        isCurrent: d.isCurrent || false,
        type: d.deviceType?.toLowerCase().includes('mobile') || d.deviceType?.toLowerCase().includes('phone') ? 'phone' : 'laptop',
        sessionId: String(d.id),
      })));
    } catch (e) {
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      await api.delete(`/auth/devices/${sessionId}`);
      toast.success('Đã đăng xuất thiết bị');
      fetchDevices();
    } catch (e) {
      toast.error('Đăng xuất thiết bị thất bại');
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      await api.post('/auth/devices/revoke-others');
      toast.success('Đã đăng xuất tất cả thiết bị khác');
      fetchDevices();
    } catch (e) {
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Quản lý Thiết bị</h1>
          <p className="text-[var(--text-secondary)] mt-1">Các thiết bị hiện đang đăng nhập vào tài khoản của bạn</p>
        </div>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleLogoutAllOthers}>
          Đăng xuất tất cả thiết bị khác
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <div key={device.id} className="bg-[var(--bg-surface)] p-5 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--bg-main)] rounded-xl text-[var(--color-ocean-600)]">
                  {device.type === 'phone' ? <Smartphone className="w-8 h-8" /> : <Monitor className="w-8 h-8" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">{device.name}</h3>
                    {device.isCurrent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded">Hiện tại</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{device.browser} trên {device.os}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Hoạt động lần cuối: {device.lastActive}</p>
                </div>
              </div>
              
              {!device.isCurrent && (
                <Button variant="outline" size="sm" className="whitespace-nowrap w-full sm:w-auto text-[var(--text-secondary)]" onClick={() => handleLogoutDevice(device.sessionId)}>
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất thiết bị này
                </Button>
              )}
            </div>
          ))}
          {devices.length === 0 && (
            <div className="text-center py-12 text-gray-500">Không có thiết bị nào.</div>
          )}
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 p-4 rounded-xl flex gap-3 mt-6">
        <ShieldAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Thiết bị lạ?</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Nếu bạn thấy thiết bị mà bạn không nhận ra, hãy đăng xuất thiết bị đó và đổi mật khẩu tài khoản của bạn ngay lập tức.</p>
        </div>
      </div>
    </div>
  );
}
