'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useBookingFlowStore, useSearchFlightStore } from '../../stores';
import { PassengerInfo as PassengerInfoType } from '../../types';

export default function PassengerInfo() {
  const navigate = useRouter();
  const { setStep, updateBookingData, passengerInfo } = useBookingFlowStore();
  const { passengers } = useSearchFlightStore();
  
  const [formData, setFormData] = useState<PassengerInfoType[]>(
    passengerInfo.length ? passengerInfo : Array.from({ length: passengers.adults }).map((_, index) => ({ 
      id: `pax-${index}`, 
      type: 'adult', 
      title: 'Mr',
      firstName: '', 
      lastName: '', 
      dob: '', 
      idNumber: '', 
      nationality: 'VN' 
    }))
  );

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  const handleChange = (index: number, field: keyof PassengerInfoType, value: string) => {
    const newForm = [...formData];
    const item = newForm[index];
    if (item) {
      newForm[index] = { ...item, [field]: value };
      setFormData(newForm);
    }
  };

  const handleNext = () => {
    // Validate
    const isValid = formData.every(p => p.firstName && p.lastName && p.dob);
    if (!isValid) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (Họ, Tên, Ngày sinh)');
      return;
    }
    updateBookingData({ passengerInfo: formData });
    navigate.push('/booking/seat');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Thông tin hành khách</h2>
      <div className="space-y-6 mb-8">
        {formData.map((p, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Hành khách {index + 1} ({p.type})</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ *</label>
                <input 
                  type="text" 
                  value={p.lastName}
                  onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="VD: NGUYEN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên đệm và Tên *</label>
                <input 
                  type="text" 
                  value={p.firstName}
                  onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="VD: VAN A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày sinh *</label>
                <input 
                  type="date" 
                  value={p.dob}
                  onChange={(e) => handleChange(index, 'dob', e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CCCD / Hộ chiếu</label>
                <input 
                  type="text" 
                  value={p.idNumber}
                  onChange={(e) => handleChange(index, 'idNumber', e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => navigate.push('/booking/fare-class')}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold"
        >
          Quay lại
        </button>
        <button 
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
