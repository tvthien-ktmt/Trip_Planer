import { useRouter } from 'next/navigation';
import { Plane, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">404</h1>
          <Plane className="w-24 h-24 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Không tìm thấy trang</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Có vẻ như chuyến bay bạn đang tìm kiếm đã cất cánh hoặc đường dẫn không tồn tại.
          </p>
        </div>

        <button 
          onClick={() => navigate.push('/')}
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-transform hover:scale-105 active:scale-95"
        >
          Trở về Trang chủ
        </button>
      </div>
    </div>
  );
}
