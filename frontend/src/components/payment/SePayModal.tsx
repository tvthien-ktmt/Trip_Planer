import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SePayModalProps {
  paymentUrl: string;
  paymentId: string;
  expiredAt: Date;
  onClose: () => void;
}

export default function SePayModal({ paymentUrl, paymentId, expiredAt, onClose }: SePayModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'EXPIRED' | 'LATE_PAYMENT'>('PENDING');
  const navigate = useRouter();

  // Countdown timer logic
  useEffect(() => {
    const targetTime = new Date(expiredAt).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((targetTime - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0 && status === 'PENDING') {
        setStatus('EXPIRED');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiredAt, status]);

  // Polling logic
  useEffect(() => {
    if (status !== 'PENDING') return;
    
    let timerId: NodeJS.Timeout;
    let currentInterval = 3000;
    const maxInterval = 10000;

    const checkStatus = async () => {
      try {
        const res = await paymentApi.getPaymentStatus(paymentId);
        if (res.data.status === 'SUCCESS') {
          setStatus('SUCCESS');
          return;
        } else if (res.data.status === 'EXPIRED') {
          setStatus('EXPIRED');
          return;
        } else if (res.data.status === 'LATE_PAYMENT') {
          setStatus('LATE_PAYMENT');
          return;
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán', error);
      }
      
      // Exponential backoff
      if (status === 'PENDING') {
        currentInterval = Math.min(currentInterval * 1.5, maxInterval);
        timerId = setTimeout(checkStatus, currentInterval);
      }
    };

    timerId = setTimeout(checkStatus, currentInterval);
    return () => clearTimeout(timerId);
  }, [paymentId, status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSuccessRedirect = () => {
    navigate.push('/booking/success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl flex flex-col items-center">
        {status === 'PENDING' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thanh toán quét mã QR</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
              Mở ứng dụng ngân hàng hoặc ví điện tử để quét mã
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 w-full flex justify-center mb-6">
              <img src={paymentUrl} alt="QR Code Thanh Toán" className="w-64 h-64 object-contain rounded-lg shadow-sm" />
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Đang chờ thanh toán...</span>
            </div>

            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-3 rounded-full font-bold text-lg">
              <span>Thời gian còn lại:</span>
              <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>

            <button onClick={onClose} className="mt-6 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
              Hủy thanh toán
            </button>
          </>
        )}

        {status === 'SUCCESS' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              Cảm ơn bạn. Đơn hàng của bạn đã được xác nhận.
            </p>
            <button onClick={handleSuccessRedirect} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
              Đi tới đơn hàng
            </button>
          </div>
        )}

        {(status === 'EXPIRED' || status === 'LATE_PAYMENT') && (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">
              {status === 'EXPIRED' ? 'Mã QR đã hết hạn' : 'Thanh toán không hợp lệ'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              {status === 'EXPIRED' 
                ? 'Thời gian chờ thanh toán đã kết thúc. Vui lòng tạo thanh toán mới.' 
                : 'Khoản thanh toán được ghi nhận sau khi mã QR hết hạn. Sản phẩm không được cấp. Vui lòng liên hệ hỗ trợ để được hoàn tiền.'}
            </p>
            <button onClick={onClose} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold mb-3">
              Thanh toán lại
            </button>
            <button onClick={() => navigate.push('/')} className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold">
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
