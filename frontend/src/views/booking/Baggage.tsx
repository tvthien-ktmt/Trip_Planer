'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { Briefcase } from 'lucide-react';

export default function Baggage() {
  const navigate = useRouter();
  const { setStep, updateBookingData, baggage } = useBookingFlowStore();

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const options = [
    { weight: 0, price: 0, label: 'Không mua thêm' },
    { weight: 10, price: 300000, label: 'Thêm 10kg' },
    { weight: 20, price: 500000, label: 'Thêm 20kg' },
    { weight: 30, price: 700000, label: 'Thêm 30kg' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-blue-600" /> Chọn hành lý mua thêm
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {options.map((opt) => (
          <div 
            key={opt.weight}
            onClick={() => updateBookingData({ baggage: { ...baggage, '0': opt.weight } })}
            className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center transition-colors ${
              baggage['0'] === opt.weight 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <span className="font-bold text-gray-900 dark:text-white">{opt.label}</span>
            <span className="text-blue-600 font-bold">+{opt.price.toLocaleString()} ₫</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => navigate.push('/booking/seat-selection')}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold"
        >
          Quay lại
        </button>
        <button 
          onClick={() => navigate.push('/booking/meal')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
