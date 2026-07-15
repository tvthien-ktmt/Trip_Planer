'use client';
import { useState } from 'react';
import { Plane, Search, Clock, MapPin } from 'lucide-react';

export default function FlightStatus() {
  const [flightNo, setFlightNo] = useState('');
  const [status, setStatus] = useState<{id: string, status: string, from: string, to: string, date: string, departure: string, arrival: string, gate: string} | null>(null);

  const handleSearch = () => {
    if (!flightNo) return;
    setStatus({
      id: flightNo,
      status: 'On Time',
      from: 'SGN',
      to: 'HAN',
      date: '20/10/2026',
      departure: '10:00',
      arrival: '12:10',
      gate: '12A'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Tình trạng chuyến bay</h1>
        <p className="text-gray-500">Nhập số hiệu chuyến bay để kiểm tra giờ cất/hạ cánh mới nhất.</p>
      </div>

      <div className="max-w-xl mx-auto flex gap-2">
        <input 
          type="text" 
          value={flightNo}
          onChange={(e) => setFlightNo(e.target.value.toUpperCase())}
          placeholder="VD: VN210" 
          className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white uppercase font-bold tracking-widest focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSearch} className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          <Search className="w-5 h-5" /> Tìm
        </button>
      </div>

      {status && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-4 py-1.5 bg-green-100 text-green-700 font-bold rounded-full text-sm">Đúng giờ (On Time)</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Chuyến bay {status.id}</h2>
          
          <div className="flex justify-between items-center relative">
            <div className="text-center w-32">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{status.from}</p>
              <p className="text-2xl font-bold text-blue-600 my-2">{status.departure}</p>
              <p className="text-sm text-gray-500">{status.date}</p>
            </div>
            
            <div className="flex-1 px-8 relative flex flex-col items-center">
              <div className="w-full h-px bg-gray-300 dark:bg-gray-600 border-dashed absolute top-1/2 -translate-y-1/2"></div>
              <Plane className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-1" />
            </div>

            <div className="text-center w-32">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{status.to}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white my-2">{status.arrival}</p>
              <p className="text-sm text-gray-500">{status.date}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Cửa ra máy bay</p>
                <p className="font-bold text-gray-900 dark:text-white">{status.gate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Thời gian bay</p>
                <p className="font-bold text-gray-900 dark:text-white">2h 10m</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
