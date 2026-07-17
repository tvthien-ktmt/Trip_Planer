'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { CreditCard, Wallet, Banknote } from 'lucide-react';

export default function Payment() {
  const navigate = useRouter();
  const { setStep, outboundFareClass, passengerInfo, addons, baggage } = useBookingFlowStore();
  const [method, setMethod] = useState('card');

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  const handlePay = () => {
    navigate.push('/booking/success');
  };

  const paxCount = Math.max(1, passengerInfo.length);
  const basePricePerPax = outboundFareClass === 'Business' ? 3000000 : 1500000;
  const basePrice = basePricePerPax * paxCount;
  const taxes = basePrice * 0.3;
  const baggageCost = Object.values(baggage).reduce((sum, w) => sum + (w * 50000), 0);
  const addonsCost = (addons.length * 200000) + baggageCost;
  const total = basePrice + taxes + addonsCost;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Phương thức thanh toán</h2>
          <div className="space-y-4">
            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${method === 'card' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <input type="radio" name="payment" checked={method === 'card'} onChange={() => setMethod('card')} className="w-5 h-5" />
              <CreditCard className="w-6 h-6 text-gray-600" />
              <span className="font-medium">Thẻ tín dụng / Ghi nợ (Visa, MasterCard)</span>
            </label>
            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${method === 'wallet' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <input type="radio" name="payment" checked={method === 'wallet'} onChange={() => setMethod('wallet')} className="w-5 h-5" />
              <Wallet className="w-6 h-6 text-gray-600" />
              <span className="font-medium">Ví điện tử (Momo, ZaloPay, VNPay)</span>
            </label>
            <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${method === 'atm' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <input type="radio" name="payment" checked={method === 'atm'} onChange={() => setMethod('atm')} className="w-5 h-5" />
              <Banknote className="w-6 h-6 text-gray-600" />
              <span className="font-medium">Thẻ ATM nội địa (Internet Banking)</span>
            </label>
          </div>
          
          {method === 'card' && (
            <div className="mt-6 space-y-4">
              <input type="text" placeholder="Số thẻ" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
                <input type="text" placeholder="CVC" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={() => navigate.push('/booking/addons')}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold"
          >
            Quay lại
          </button>
          <button 
            onClick={handlePay}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
          >
            Thanh toán ngay
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 h-fit sticky top-24 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Chi tiết thanh toán</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Vé máy bay ({paxCount}x)</span>
            <span className="font-medium">{basePrice.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế & Phí</span>
            <span className="font-medium">{taxes.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between">
            <span>Dịch vụ bổ sung</span>
            <span className="font-medium">{addonsCost.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}
