'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { Shield, Wifi, Car } from 'lucide-react';

export default function AddOns() {
  const navigate = useRouter();
  const { setStep, updateBookingData, addons } = useBookingFlowStore();

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  const toggleAddOn = (id: string) => {
    if (addons.includes(id)) {
      updateBookingData({ addons: addons.filter(a => a !== id) });
    } else {
      updateBookingData({ addons: [...addons, id] });
    }
  };

  const options = [
    { id: 'insurance', title: 'Bảo hiểm trễ chuyến', desc: 'Bồi thường lên đến 2.000.000đ khi chuyến bay trễ trên 2 giờ.', price: 150000, icon: <Shield className="w-8 h-8 text-blue-500" /> },
    { id: 'wifi', title: 'Wi-Fi trên chuyến bay', desc: 'Lướt web tốc độ cao không giới hạn trong suốt chuyến bay.', price: 200000, icon: <Wifi className="w-8 h-8 text-blue-500" /> },
    { id: 'transfer', title: 'Đưa đón sân bay', desc: 'Xe riêng đón tận nơi từ sân bay về trung tâm thành phố.', price: 350000, icon: <Car className="w-8 h-8 text-blue-500" /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dịch vụ bổ sung</h2>
      <div className="space-y-4 mb-8">
        {options.map(opt => (
          <div 
            key={opt.id}
            onClick={() => toggleAddOn(opt.id)}
            className={`border-2 rounded-xl p-4 flex gap-4 cursor-pointer transition-colors ${
              addons.includes(opt.id)
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <div className="shrink-0">{opt.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{opt.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{opt.desc}</p>
            </div>
            <div className="font-bold text-blue-600 whitespace-nowrap">
              +{opt.price.toLocaleString()} ₫
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => navigate.push('/booking/meal')}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold"
        >
          Quay lại
        </button>
        <button 
          onClick={() => navigate.push('/booking/payment')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
