'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { Check } from 'lucide-react';
import { BookingStep } from '../../types';

export default function FareClass() {
  const navigate = useRouter();
  const { setStep, updateBookingData, outboundFareClass } = useBookingFlowStore();

  useEffect(() => {
    setStep(BookingStep.FARE_CLASS);
  }, [setStep]);

  const handleSelect = (fareClass: string, price: number) => {
    updateBookingData({ outboundFareClass: fareClass, selectedFlightPricing: price });
  };

  const handleNext = () => {
    if (!outboundFareClass) {
      toast.error('Vui lòng chọn hạng vé');
      return;
    }
    navigate.push('/booking/passenger');
  };

  const fares = [
    { name: 'Economy', price: 1500000, features: ['Hành lý xách tay 10kg', 'Hành lý ký gửi 23kg', 'Đổi vé có phí'] },
    { name: 'Business', price: 4500000, features: ['Hành lý xách tay 12kg', 'Hành lý ký gửi 32kg', 'Phòng chờ thương gia', 'Đổi vé miễn phí'] }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Chọn hạng vé</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {fares.map((fare) => (
          <div 
            key={fare.name}
            onClick={() => handleSelect(fare.name, fare.price)}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              outboundFareClass === fare.name 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{fare.name}</h3>
            <div className="text-2xl font-bold text-blue-600 mb-4">{fare.price.toLocaleString()} ₫</div>
            <ul className="space-y-2">
              {fare.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Check className="w-4 h-4 text-green-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handleNext}
          disabled={!outboundFareClass}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
