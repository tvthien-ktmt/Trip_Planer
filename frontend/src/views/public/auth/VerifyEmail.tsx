import { useRouter } from 'next/navigation';
import { Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const navigate = useRouter();

  const handleVerify = () => {
    toast.success('Xác minh thành công!');
    navigate.push('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vui lòng kiểm tra email</h1>
        <p className="text-gray-500 mb-8">
          Chúng tôi đã gửi một liên kết xác minh tài khoản đến email của bạn. Vui lòng kiểm tra hộp thư đến và nhấn vào liên kết.
        </p>

        <button 
          onClick={handleVerify}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30"
        >
          <CheckCircle className="w-5 h-5" /> Tôi đã xác minh (Demo)
        </button>

        <div className="mt-8 text-sm text-gray-500">
          Chưa nhận được email? <button className="text-blue-600 font-medium hover:underline">Gửi lại email xác minh</button>
        </div>
      </div>
    </div>
  );
}
