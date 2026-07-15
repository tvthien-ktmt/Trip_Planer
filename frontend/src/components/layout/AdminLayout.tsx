
import { AdminSidebar } from './AdminSidebar';
import { useUIStore } from '../../stores';
import { Bell, Search, Sun, Moon } from 'lucide-react';

export const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-100'}`}>
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        {/* Admin Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg w-96">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã PNR, tên khách hàng..." 
              className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
