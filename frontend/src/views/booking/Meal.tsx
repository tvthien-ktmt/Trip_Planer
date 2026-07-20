'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { Coffee } from 'lucide-react';

import { BookingStep } from '../../types';

export default function Meal() {
  const navigate = useRouter();
  const { setStep, updateBookingData, meals } = useBookingFlowStore();

  useEffect(() => {
    setStep(BookingStep.MEAL);
  }, [setStep]);

  const options = [
    { id: 'm1', name: 'Mì xào hải sản', price: 150000, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80' },
    { id: 'm2', name: 'Cơm gà quay', price: 150000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80' },
    { id: 'm3', name: 'Bánh mì thịt', price: 80000, img: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=300&q=80' },
  ];

  const handleSelect = (mealId: string) => {
    const current = meals['0'];
    if (current === mealId) {
      const newMeals = { ...meals };
      delete newMeals['0'];
      updateBookingData({ meals: newMeals });
    } else {
      updateBookingData({ meals: { ...meals, '0': mealId } });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Coffee className="w-6 h-6 text-blue-600" /> Chọn suất ăn
      </h2>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {options.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-colors ${
              meals['0'] === opt.id 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <img src={opt.img} alt={opt.name} className="w-full h-32 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{opt.name}</h3>
              <p className="text-blue-600 font-bold mt-2">+{opt.price.toLocaleString()} ₫</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => navigate.push('/booking/baggage')}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold"
        >
          Quay lại
        </button>
        <button 
          onClick={() => navigate.push('/booking/addons')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
