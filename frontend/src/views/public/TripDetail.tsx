'use client';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTourDetailQuery, useReviewsQuery } from '../../hooks/queries';
import { ImageGallery } from '../../components/common/ImageGallery';
import { PriceTag } from '../../components/common/PriceTag';
import { RatingStars } from '../../components/common/RatingStars';
import { Skeleton } from '../../components/common/Skeleton';
import { useBookingCartStore, useWishlistStore, useSearchStore, useAuthStore } from '../../stores';
import { MapPin, Clock, Users, Heart, Share2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function TripDetail() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useRouter();
  
  const { data: tour, isLoading } = useTourDetailQuery(id || '');
  const { data: reviews } = useReviewsQuery(id || '');
  
  const { addItem } = useBookingCartStore();
  const { tourIds: wishlist, toggleTour } = useWishlistStore();
  const { pax, setPax } = useSearchStore();
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews' | 'policy'>('overview');
  const [selectedDate, setSelectedDate] = useState<string>('');

  if (isLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="w-full h-96 rounded-2xl" /></div>;
  if (!tour) return <div className="container mx-auto px-4 py-8 text-center text-xl">Không tìm thấy Tour</div>;

  const isWished = wishlist.includes(tour.id);

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đặt Tour', {
        action: { label: 'Đăng nhập', onClick: () => setLoginModalOpen(true) }
      });
      return;
    }
    if (!selectedDate) {
      toast.error('Vui lòng chọn ngày khởi hành');
      return;
    }
    const totalPrice = (pax.adults * tour.price) + (pax.children * tour.price * 0.7);
    addItem({
      id: `cart-${Date.now()}`,
      tourId: tour.id,
      tourTitle: tour.title,
      tourImage: tour.images[0],
      date: selectedDate,
      pax,
      pricePerAdult: tour.price,
      pricePerChild: tour.price * 0.7,
      totalPrice
    });
    toast.success('Đã thêm vào giỏ hàng');
    navigate.push('/reservation');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">{tour.type === 'Group' ? 'Ghép đoàn' : 'Riêng tư'}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">{tour.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{tour.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tour.location}</div>
            <div className="flex items-center gap-1"><RatingStars rating={tour.rating} /> ({tour.reviewsCount} đánh giá)</div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                toast.info('Vui lòng đăng nhập để lưu địa điểm yêu thích', {
                  action: { label: 'Đăng nhập', onClick: () => setLoginModalOpen(true) }
                });
                return;
              }
              toggleTour(tour.id);
            }} 
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Heart className={`w-5 h-5 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
          </button>
          <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <ImageGallery images={tour.images} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
            {(
              [
                { id: 'overview', label: 'Tổng quan' },
                { id: 'itinerary', label: 'Lịch trình' },
                { id: 'reviews', label: 'Đánh giá' },
                { id: 'policy', label: 'Chính sách' }
              ] as const
            ).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-4 font-semibold whitespace-nowrap ${activeTab === t.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Thời gian</div>
                      <div className="font-semibold dark:text-white">{tour.durationDays}N {tour.durationNights}Đ</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Số lượng tối đa</div>
                      <div className="font-semibold dark:text-white">{tour.maxGroupSize} người</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 dark:text-white">Mô tả</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{tour.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-6 relative border-l-2 border-blue-200 dark:border-blue-900 ml-4">
                {tour.itinerary.map((day) => (
                  <div key={day.day} className="relative pl-8 pb-8 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white dark:ring-gray-950" />
                    <div className="text-sm font-bold text-blue-600 mb-1">Ngày {day.day}</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{day.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{day.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-yellow-600">{tour.rating}</div>
                    <div>
                      <RatingStars rating={tour.rating} className="mb-1" />
                      <div className="text-gray-500 text-sm">Dựa trên {tour.reviewsCount} đánh giá</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.info('Vui lòng đăng nhập để viết đánh giá', {
                          action: { label: 'Đăng nhập', onClick: () => setLoginModalOpen(true) }
                        });
                        return;
                      }
                      toast.success('Cảm ơn bạn! Tính năng viết đánh giá sẽ sớm ra mắt.');
                    }}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Viết đánh giá
                  </button>
                </div>
                {reviews?.map(review => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 mb-6 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img src={review.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="font-bold dark:text-white">{review.userName}</div>
                          <div className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'policy' && (
              <ul className="list-disc pl-5 space-y-3 text-gray-600 dark:text-gray-300">
                {tour.policies.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar / Booking Form */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 sticky top-24">
            <div className="flex items-end gap-2 mb-6">
              <PriceTag amount={tour.price} className="text-3xl" />
              <span className="text-gray-500 mb-1">/ người</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Ngày khởi hành</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Khách</label>
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                  <div className="dark:text-white">Người lớn</div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPax({ adults: Math.max(1, pax.adults - 1) })} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">-</button>
                    <span className="w-4 text-center dark:text-white">{pax.adults}</span>
                    <button onClick={() => setPax({ adults: pax.adults + 1 })} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600 mt-2">
                  <div className="dark:text-white">Trẻ em <span className="text-xs text-gray-400 block">Dưới 12 tuổi</span></div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPax({ children: Math.max(0, pax.children - 1) })} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">-</button>
                    <span className="w-4 text-center dark:text-white">{pax.children}</span>
                    <button onClick={() => setPax({ children: pax.children + 1 })} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex justify-between font-bold text-lg dark:text-white mb-2">
                <span>Tổng tiền:</span>
                <PriceTag amount={(pax.adults * tour.price) + (pax.children * tour.price * 0.7)} />
              </div>
              <p className="text-xs text-center text-gray-500">Chưa bao gồm thuế và phí dịch vụ</p>
            </div>

            <button 
              onClick={handleBook}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              Đặt chỗ ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
