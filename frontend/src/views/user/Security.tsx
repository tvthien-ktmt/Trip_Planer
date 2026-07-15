import { Smartphone, Monitor, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function Security() {
  const handleToggle2FA = () => {
    toast.success('Đã cập nhật cài đặt 2FA');
  };

  const handleLogoutDevice = () => {
    toast.success('Đã đăng xuất khỏi thiết bị');
  };

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bảo mật</h1>

      {/* Đổi mật khẩu */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h2>
        </div>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu hiện tại</label>
            <input type="password" placeholder="••••••••" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
            <input type="password" placeholder="••••••••" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-full">
            Cập nhật mật khẩu
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 h-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Xác thực 2 lớp (2FA)</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Thêm một lớp bảo mật phụ để bảo vệ tài khoản của bạn khỏi việc truy cập trái phép.</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" className="sr-only peer" defaultChecked onChange={handleToggle2FA} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Quản lý thiết bị */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thiết bị đã đăng nhập</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
            <div className="flex items-center gap-4">
              <Monitor className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Windows PC - Chrome</p>
                <p className="text-xs text-gray-500 mt-0.5">TP. Hồ Chí Minh, Việt Nam • Thiết bị hiện tại</p>
              </div>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">Đang hoạt động</span>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
            <div className="flex items-center gap-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">iPhone 14 Pro - Safari</p>
                <p className="text-xs text-gray-500 mt-0.5">Hà Nội, Việt Nam • Đăng nhập hôm qua</p>
              </div>
            </div>
            <button onClick={handleLogoutDevice} className="text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
