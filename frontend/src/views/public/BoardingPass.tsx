'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { Plane } from 'lucide-react';

export default function BoardingPass() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex justify-center">
      <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
        <div className="h-4 bg-blue-600 w-full"></div>
        
        <div className="p-8 pb-12 border-b-2 border-dashed border-gray-300 dark:border-gray-600 relative">
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gray-50 dark:bg-gray-950 rounded-full border border-gray-200 dark:border-gray-700"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gray-50 dark:bg-gray-950 rounded-full border border-gray-200 dark:border-gray-700"></div>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-blue-600 tracking-wider">BOARDING PASS</h2>
            <p className="text-gray-500 font-bold">ECONOMY</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900 dark:text-white">SGN</p>
              <p className="text-gray-500 mt-1">Hồ Chí Minh</p>
            </div>
            <div className="flex flex-col items-center">
              <Plane className="w-8 h-8 text-blue-600 rotate-90" />
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">VN210</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900 dark:text-white">HAN</p>
              <p className="text-gray-500 mt-1">Hà Nội</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Passenger</p>
              <p className="font-bold text-gray-900 dark:text-white truncate">NGUYEN VAN A</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Date</p>
              <p className="font-bold text-gray-900 dark:text-white">20 OCT 2026</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Boarding Time</p>
              <p className="font-bold text-blue-600 text-xl">09:30</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Gate</p>
              <p className="font-bold text-gray-900 dark:text-white text-xl">12A</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Seat</p>
              <p className="font-bold text-gray-900 dark:text-white text-xl">15C</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">PNR</p>
              <p className="font-bold text-gray-900 dark:text-white tracking-widest">{id?.toUpperCase() || 'VN8A2B'}</p>
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">Gate closes 15 minutes before departure</p>
          <div className="w-full h-24 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e9/UPC-A-036000291452.svg')] bg-contain bg-center bg-no-repeat opacity-50 dark:invert"></div>
        </div>
      </div>
    </div>
  );
}
