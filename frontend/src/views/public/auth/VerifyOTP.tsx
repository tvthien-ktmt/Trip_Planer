'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter , useSearchParams} from 'next/navigation';
import { toast } from 'sonner';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent pasting multiple chars
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    setIsLoading(true);
    try {
      const otpCode = otp.join('');
      // FE-004 fix: Navigate to correct path without /auth/ prefix
      navigate.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xác minh OTP</h1>
        <p className="text-gray-500 mb-8">Chúng tôi đã gửi mã gồm 6 chữ số đến email <br/><span className="font-medium text-gray-900 dark:text-gray-300">{email}</span></p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white"
              />
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xác minh...' : 'Xác minh'}
          </button>
        </form>

        <div className="mt-8 text-gray-500">
          Chưa nhận được mã? <button className="text-blue-600 font-medium hover:underline">Gửi lại (60s)</button>
        </div>
      </div>
    </div>
  );
}
