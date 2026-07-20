'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'RESET_PASSWORD' }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Có lỗi xảy ra');
        return;
      }
      toast.success('Mã OTP đã được gửi đến email của bạn');
      // FE-004 fix: Navigate to correct path without /auth/ prefix
      navigate.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error('Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition text-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
        </Link>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quên mật khẩu?</h1>
          <p className="text-gray-500 mt-2">Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi mã khôi phục.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white"
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
          </button>
        </form>
      </div>
    </div>
  );
}
