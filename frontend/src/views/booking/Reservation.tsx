'use client';
import { useState } from 'react';
import { useBookingCartStore, useAuthStore } from '../../stores';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PriceTag } from '../../components/common/PriceTag';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CreditCard, Wallet, Banknote, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Họ tên bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'SĐT không hợp lệ'),
  note: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Reservation() {
  const [bookingCode] = useState(() => crypto.randomUUID().substring(0, 8).toUpperCase());
  const { items, getTotal, removeItem, clearCart } = useBookingCartStore();
  const { user } = useAuthStore();
  const navigate = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'bank'>('card');
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  });

  const onSubmit = async (data: ContactForm) => {
    if (items.length === 0) return;
    
    // Fake API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccessModalOpen(true);
  };

  const handleFinish = () => {
    clearCart();
    setSuccessModalOpen(false);
    navigate.push('/user/bookings'); // Chuyển đến lịch sử đặt chỗ
  };

  if (items.length === 0 && !isSuccessModalOpen) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState 
          title="Giỏ hàng trống" 
          description="Bạn chưa chọn tour nào để đặt chỗ. Hãy khám phá các tour hấp dẫn của chúng tôi nhé!"
        />
        <div className="text-center mt-6">
          <Link href="/tours" className="text-blue-600 font-semibold hover:underline">
            Khám phá Tours ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Thanh toán & Đặt chỗ</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            <form id="reservation-form" onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                Thông tin liên hệ
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                  <input {...register('fullName')} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input {...register('email')} type="email" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                  <input {...register('phone')} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú thêm</label>
                  <textarea {...register('note')} rows={3} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white placeholder-gray-400" placeholder="Yêu cầu đặc biệt (ăn chay, dị ứng...)" />
                </div>
              </div>
            </form>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-blue-600" />
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold dark:text-white">Thẻ tín dụng / Ghi nợ</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, JCB</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="w-5 h-5 text-blue-600" />
                  <Wallet className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  <div>
                    <div className="font-semibold dark:text-white">Ví MoMo</div>
                    <div className="text-sm text-gray-500">Quét mã QR qua ứng dụng MoMo</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="w-5 h-5 text-blue-600" />
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold dark:text-white">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-gray-500">Chuyển khoản qua số tài khoản</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Cart Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 relative group">
                    <img src={item.tourImage} alt={item.tourTitle} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm mb-1">{item.tourTitle}</h4>
                      <div className="text-xs text-gray-500 mb-1">Ngày: {item.date}</div>
                      <div className="text-xs text-gray-500 mb-2">Khách: {item.pax.adults} NL{item.pax.children > 0 ? `, ${item.pax.children} TE` : ''}</div>
                      <PriceTag amount={item.totalPrice} className="font-bold text-sm text-blue-600" />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <PriceTag amount={getTotal()} />
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Thuế & Phí (10%)</span>
                  <PriceTag amount={getTotal() * 0.1} />
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Tổng cộng</span>
                  <PriceTag amount={getTotal() * 1.1} className="text-red-600" />
                </div>
              </div>

              <button
                type="submit"
                form="reservation-form"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isSuccessModalOpen} onClose={() => navigate.push('/')}>
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thanh toán thành công!</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Mã đặt chỗ của bạn là <span className="font-bold text-gray-900 dark:text-white">#TP-{bookingCode}</span>. 
            Thông tin vé đã được gửi vào email của bạn.
          </p>
          <button 
            onClick={handleFinish}
            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Xem lịch sử đặt chỗ
          </button>
        </div>
      </Modal>
    </div>
  );
}
