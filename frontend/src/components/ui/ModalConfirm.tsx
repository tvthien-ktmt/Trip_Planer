import { Fragment } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface ModalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  isLoading = false
}: ModalConfirmProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', btnVariant: 'primary' as const, btnClass: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', btnVariant: 'primary' as const, btnClass: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', btnVariant: 'primary' as const, btnClass: '' },
  };

  const Config = typeConfig[type];
  const Icon = Config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--bg-surface)] rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${Config.bg}`}>
            <Icon className={`w-7 h-7 ${Config.color}`} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
          <p className="text-[var(--text-secondary)] mb-8">{message}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={Config.btnVariant} 
            className={`flex-1 ${Config.btnClass}`} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
