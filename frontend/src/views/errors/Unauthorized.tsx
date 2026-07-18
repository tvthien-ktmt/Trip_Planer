'use client';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">401</h1>
          <ShieldAlert className="w-24 h-24 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chưa Đăng Nhập</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Bạn cần đăng nhập để truy cập vào tính năng này.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate.push('/login')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-transform hover:scale-105 active:scale-95"
          >
            <LogIn className="w-5 h-5" /> Đi đến trang Đăng nhập
          </button>
          <button 
            onClick={() => navigate.push('/')}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium hover:underline"
          >
            Trở về Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
