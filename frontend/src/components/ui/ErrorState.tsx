import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Đã có lỗi xảy ra', 
  message = 'Không thể tải dữ liệu vào lúc này. Vui lòng thử lại sau.', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[var(--radius-radius-md)] min-h-[200px]">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">{title}</h3>
      <p className="text-red-600 dark:text-red-300/80 text-sm max-w-md mx-auto mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100" onClick={onRetry}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Thử lại
        </Button>
      )}
    </div>
  );
}
