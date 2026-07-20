import { useCompareStore } from '../../stores';
import { X, Check } from 'lucide-react';
import { PriceTag } from '../common/PriceTag';
import { RatingStars } from '../common/RatingStars';
import { useRouter } from 'next/navigation';
import { routes } from '../../lib/routes';

export const CompareModal = () => {
  const navigate = useRouter();
  const { tours, isCompareModalOpen, setCompareModalOpen, removeTour } = useCompareStore();

  if (!isCompareModalOpen || tours.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 id="compare-modal-title" className="text-2xl font-bold dark:text-white">So sánh Tour ({tours.length})</h2>
          <button 
            onClick={() => setCompareModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex min-w-[600px] gap-6">
            {tours.map(tour => (
              <div key={tour.id} className="flex-1 flex flex-col relative border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => removeTour(tour.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  title="Gỡ bỏ"
                >
                  <X className="w-4 h-4" />
                </button>
                <img src={tour.images[0]} alt={tour.title} className="w-full h-48 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 dark:text-white line-clamp-2">{tour.title}</h3>
                  <div className="text-gray-500 text-sm mb-4">{tour.location}</div>
                  
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Giá</div>
                      <PriceTag amount={tour.price} className="text-xl" />
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Đánh giá</div>
                      <div className="flex items-center gap-2">
                        <RatingStars rating={tour.rating} />
                        <span className="text-sm font-semibold dark:text-gray-300">{tour.rating}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Thời gian</div>
                      <div className="font-medium dark:text-gray-300">{tour.durationDays} Ngày {tour.durationNights} Đêm</div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Chủ đề</div>
                      <div className="inline-flex px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-md font-medium">
                        {tour.category}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setCompareModalOpen(false);
                      navigate.push(routes.tourDetail(tour.id));
                    }}
                    className="mt-6 w-full py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
