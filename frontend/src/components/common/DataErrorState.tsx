import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface DataErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export const DataErrorState = ({ onRetry, message = "Đã có lỗi xảy ra khi tải dữ liệu." }: DataErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không thể kết nối</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
      >
        <RefreshCcw className="w-5 h-5" />
        Thử lại
      </button>
    </div>
  );
};
