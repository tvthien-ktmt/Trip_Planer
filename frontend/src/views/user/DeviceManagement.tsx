import { Monitor, Smartphone, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function DeviceManagement() {
  const devices = [
    { id: 'dev-1', name: 'MacBook Pro của Tôi', os: 'macOS Sonoma', browser: 'Chrome', lastActive: 'Đang hoạt động ngay bây giờ', isCurrent: true, type: 'laptop' },
    { id: 'dev-2', name: 'iPhone 14 Pro', os: 'iOS 17', browser: 'Safari Mobile', lastActive: 'Hoạt động 3 giờ trước', isCurrent: false, type: 'phone' },
    { id: 'dev-3', name: 'iPad Air', os: 'iPadOS', browser: 'Safari', lastActive: 'Hoạt động 2 ngày trước', isCurrent: false, type: 'tablet' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Quản lý Thiết bị</h1>
          <p className="text-[var(--text-secondary)] mt-1">Các thiết bị hiện đang đăng nhập vào tài khoản của bạn</p>
        </div>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
          Đăng xuất tất cả thiết bị khác
        </Button>
      </div>

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
              <Button variant="outline" size="sm" className="whitespace-nowrap w-full sm:w-auto text-[var(--text-secondary)]">
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất thiết bị này
              </Button>
            )}
          </div>
        ))}
      </div>

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
