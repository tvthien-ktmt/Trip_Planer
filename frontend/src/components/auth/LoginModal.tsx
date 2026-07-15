'use client';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useAuthStore } from '../../stores';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login } = useAuthStore();
  const navigate = useRouter();
  const location = usePathname();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Validate mock credentials
      if (
        !(email === 'user@gmail.com' && password === '123456') &&
        !(email === 'admin@gmail.com' && password === '123456')
      ) {
        toast.error('Email hoặc mật khẩu không đúng!');
        setIsLoading(false);
        return;
      }

      // Mock successful login
      const mockUser: import('../../types').User = {
        id: 'user-1',
        name: 'Nguyễn Văn A',
        email: email,
        phone: '0123456789',
        role: email === 'admin@gmail.com' ? 'Admin' : 'User',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
      };

      login(mockUser, 'mock-token-12345');
      toast.success('Đăng nhập thành công!');
      setLoginModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          onClick={() => setLoginModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 id="login-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đăng nhập</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Đăng nhập để tiếp tục thao tác và nhận các ưu đãi tốt nhất.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Dùng thử: <span className="font-semibold">user@gmail.com</span> / <span className="font-semibold">123456</span>
          </div>
        </div>
      </div>
    </div>
  );
};
