import { useCompareStore } from '../../stores';
import { X, ArrowRightLeft } from 'lucide-react';

export const CompareBar = () => {
  const { tours, removeTour, clearCompare, setCompareModalOpen } = useCompareStore();

  if (tours.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 transform transition-transform duration-300 translate-y-0">
      <div className="max-w-5xl mx-auto bg-gray-900/95 dark:bg-black/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-4 flex flex-col md:flex-row items-center gap-4 text-white">
        
        <div className="flex-1 flex flex-wrap items-center gap-4">
          <div className="font-semibold text-lg hidden md:block">
            So sánh Tour ({tours.length}/3)
          </div>
          <div className="flex gap-2 flex-wrap">
            {tours.map(tour => (
              <div key={tour.id} className="flex items-center gap-2 bg-gray-800 dark:bg-gray-900 rounded-lg pr-2 pl-3 py-1.5 border border-gray-700">
                <span className="text-sm font-medium truncate max-w-[120px]">{tour.title}</span>
                <button 
                  onClick={() => removeTour(tour.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - tours.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-center w-32 h-[34px] rounded-lg border border-dashed border-gray-600 text-gray-500 text-sm">
                Trống
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={clearCompare}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
          >
            Xóa tất cả
          </button>
          <button
            onClick={() => setCompareModalOpen(true)}
            disabled={tours.length < 2}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
            So sánh ngay
          </button>
        </div>
      </div>
    </div>
  );
};
