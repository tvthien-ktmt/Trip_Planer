import { Heart, Star, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';


export default function Wishlist() {
  const wishlistItems = [
    { id: '1', title: 'Khám phá Vịnh Hạ Long 2 ngày 1 đêm', type: 'Tour', rating: 4.8, price: '3,200,000', location: 'Hạ Long, Việt Nam', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400&auto=format&fit=crop' },
    { id: '2', title: 'Khách sạn InterContinental Đà Nẵng', type: 'Hotel', rating: 4.9, price: '8,500,000 / đêm', location: 'Đà Nẵng, Việt Nam', img: 'https://images.unsplash.com/photo-1582650042456-4b20a40d5885?q=80&w=800&auto=format&fit=crop' },
    { id: '3', title: 'Vé máy bay khứ hồi HCM - Tokyo', type: 'Flight', rating: null, price: '12,000,000', location: 'Narita, Nhật Bản', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Danh sách Yêu thích</h1>
          <p className="text-[var(--text-secondary)] mt-1">Lưu trữ các chuyến bay, tour, và khách sạn bạn quan tâm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[var(--radius-radius-md)] shadow-sm overflow-hidden flex flex-col sm:flex-row group transition-custom hover:shadow-md hover:border-[var(--color-ocean-600)]">
            <div className="sm:w-40 h-40 relative flex-shrink-0">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              <button className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white transition-colors">
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-[var(--color-ocean-600)] uppercase tracking-wider">{item.type}</span>
                  {item.rating && (
                    <div className="flex items-center text-sm font-medium">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" /> {item.rating}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-[var(--text-primary)] line-clamp-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> {item.location}
                </p>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-0.5">Giá từ</p>
                  <p className="font-bold text-[var(--color-coral-500)]">{item.price} ₫</p>
                </div>
                <Button size="sm" variant="primary">Đặt ngay</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlistItems.length === 0 && (
        <div className="text-center py-16 bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-main)]">
          <Heart className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Chưa có mục nào được lưu</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">Bạn có thể lưu các chuyến bay, tour du lịch, hoặc khách sạn yêu thích để dễ dàng xem lại và đặt chỗ sau.</p>
          <Link href="/">
            <Button variant="primary">Khám phá ngay</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
