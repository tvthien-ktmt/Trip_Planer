'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../stores';
import { Check, Loader2 } from 'lucide-react';
import { BookingStep } from '../../types';

export default function FareClass() {
  const navigate = useRouter();
  const { setStep, updateBookingData, outboundFareClass, selectedOutboundFlightId } = useBookingFlowStore();
  const [fares, setFares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStep(BookingStep.FARE_CLASS);
  }, [setStep]);

  useEffect(() => {
    const fetchFares = async () => {
      if (!selectedOutboundFlightId) {
        toast.error('Chưa chọn chuyến bay, vui lòng quay lại bước trước');
        navigate.push('/search');
        return;
      }
      
      try {
        const { api } = await import('../../lib/api');
        const res = await api.get(`/flights/${selectedOutboundFlightId}`);
        const flightData = res.data?.data || res.data;
        
        if (flightData?.fareClasses) {
          const mappedFares = flightData.fareClasses.map((fc: any) => ({
            name: fc.className,
            price: Number(fc.basePrice),
            features: getFeaturesByClass(fc.className)
          }));
          
          setFares(mappedFares.length > 0 ? mappedFares : getDefaultFares());
        } else {
          setFares(getDefaultFares());
        }
      } catch (error) {
        toast.error('Không thể tải thông tin hạng vé');
        setFares(getDefaultFares());
      } finally {
        setLoading(false);
      }
    };
    
    fetchFares();
  }, [selectedOutboundFlightId, navigate]);

  const getFeaturesByClass = (className: string) => {
    if (className === 'BUSINESS' || className.toLowerCase().includes('business')) {
      return ['Hành lý xách tay 12kg', 'Hành lý ký gửi 32kg', 'Phòng chờ thương gia', 'Đổi vé miễn phí'];
    }
    return ['Hành lý xách tay 10kg', 'Hành lý ký gửi 23kg', 'Đổi vé có phí'];
  };

  const getDefaultFares = () => [
    { name: 'ECONOMY', price: 1500000, features: ['Hành lý xách tay 10kg', 'Hành lý ký gửi 23kg', 'Đổi vé có phí'] },
    { name: 'BUSINESS', price: 4500000, features: ['Hành lý xách tay 12kg', 'Hành lý ký gửi 32kg', 'Phòng chờ thương gia', 'Đổi vé miễn phí'] }
  ];

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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Đang tải thông tin hạng vé...</p>
      </div>
    );
  }

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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase">{fare.name}</h3>
            <div className="text-2xl font-bold text-blue-600 mb-4">{fare.price.toLocaleString()} ₫</div>
            <ul className="space-y-2">
              {fare.features.map((f: string, i: number) => (
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
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
