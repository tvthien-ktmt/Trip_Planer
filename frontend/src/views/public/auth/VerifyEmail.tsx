'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams?.get('email');
    const otpParam = searchParams?.get('otp') || searchParams?.get('token');
    
    if (emailParam) setEmail(emailParam);
    if (otpParam) setOtp(otpParam);

    // If both are present, auto-verify
    if (emailParam && otpParam) {
      handleVerify(emailParam, otpParam);
    }
  }, [searchParams]);

  const handleVerify = async (emailToVerify = email, otpToVerify = otp) => {
    if (!emailToVerify || !otpToVerify) {
      toast.error('Vui lòng nhập email và mã xác minh');
      return;
    }

    setLoading(true);
    try {
      const { api } = await import('../../../lib/api');
      // Using verify-otp endpoint for email verification (purpose REGISTER)
      await api.post('/auth/verify-otp', {
        email: emailToVerify,
        otp: otpToVerify,
        purpose: 'REGISTER'
      });
      toast.success('Xác minh thành công!');
      navigate.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã xác minh không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email để gửi lại mã');
      return;
    }
    setResending(true);
    try {
      const { api } = await import('../../../lib/api');
      await api.post('/auth/send-otp', {
        email,
        purpose: 'REGISTER'
      });
      toast.success('Đã gửi lại mã xác minh. Vui lòng kiểm tra email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi lại mã xác minh.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xác minh email</h1>
        <p className="text-gray-500 mb-8">
          Chúng tôi đã gửi mã xác minh gồm 6 số đến email của bạn. Vui lòng kiểm tra hộp thư đến và nhập mã vào bên dưới.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white text-center"
            />
          </div>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập mã 6 số"
              required
              maxLength={6}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white text-center tracking-widest text-lg font-bold"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            Xác minh
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-500">
          Chưa nhận được email?{' '}
          <button 
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 font-medium hover:underline disabled:opacity-50"
          >
            {resending ? 'Đang gửi...' : 'Gửi lại mã'}
          </button>
        </div>
      </div>
    </div>
  );
}
