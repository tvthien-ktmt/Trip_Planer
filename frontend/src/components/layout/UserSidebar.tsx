import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { 
  LayoutDashboard, 
  User, 
  ShieldCheck, 
  Bell, 
  Ticket, 
  Gift, 
  Crown, 
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../../stores';

export const UserSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const menu = [
    { name: 'Tổng quan', path: '/user/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Hồ sơ của tôi', path: '/user/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Bảo mật', path: '/user/security', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'Chuyến bay của tôi', path: '/user/bookings', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Thông báo', path: '/user/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Voucher & Ưu đãi', path: '/user/vouchers', icon: <Gift className="w-5 h-5" /> },
    { name: 'Thẻ thành viên', path: '/user/membership', icon: <Crown className="w-5 h-5" /> },
    { name: 'Cài đặt chung', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hidden md:block shrink-0 h-fit sticky top-24">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-2xl mb-4">
          N
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white">Nguyễn Văn A</h3>
        <p className="text-sm text-gray-500">Hội viên Bạc</p>
      </div>
      <div className="p-4 space-y-1">
        {menu.map(item => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                ((pathname || "") === item.path || (pathname || "").startsWith(item.path)) 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};
