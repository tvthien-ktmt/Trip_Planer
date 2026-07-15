'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, CheckCircle2 } from 'lucide-react';

export default function CheckIn() {
  const [pnr, setPnr] = useState('');
  const [name, setName] = useState('');
  const navigate = useRouter();

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnr && name) {
      navigate.push(`/boarding-pass/${pnr}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Check-in Trực tuyến</h1>
          <p className="text-sm text-gray-500 mt-2">Tiết kiệm thời gian chờ đợi tại sân bay</p>
        </div>

        <form onSubmit={handleCheckIn} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mã đặt chỗ (PNR) *</label>
            <input 
              type="text" 
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="Gồm 6 chữ cái/số"
              maxLength={6}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold tracking-widest uppercase focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Họ và Tên *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="VD: NGUYEN VAN A"
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium uppercase focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            Tiếp tục <Plane className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
