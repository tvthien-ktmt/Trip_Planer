import { useRouter } from 'next/navigation';
import { Ban, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  const navigate = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">403</h1>
          <Ban className="w-24 h-24 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Truy cập bị từ chối</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Tài khoản của bạn không có quyền truy cập vào khu vực này.
          </p>
        </div>

        <button 
          onClick={() => navigate.back()}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại trang trước
        </button>
      </div>
    </div>
  );
}
