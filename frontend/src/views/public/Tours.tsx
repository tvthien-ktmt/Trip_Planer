'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useToursQuery } from '../../hooks/queries';
import { SearchBar } from '../../components/common/SearchBar';
import { RatingStars } from '../../components/common/RatingStars';
import { Pagination } from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import { DataErrorState } from '../../components/common/DataErrorState';
import { useWishlistStore, useAuthStore, useCompareStore } from '../../stores';
import { Map, List, Heart, MapPin, Clock, Filter, ChevronDown, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CompareBar } from '../../components/trip/CompareBar';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/ui/Button';

export default function Tours() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const locationParam = searchParams?.get('location');
  const destinationParam = searchParams?.get('destination');

  const { data: tours, isLoading, isError, refetch } = useToursQuery();
  const { tourIds: wishlist, toggleTour } = useWishlistStore();
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();
  const { tours: toursToCompare, addTour: addCompareTour, removeTour: removeCompareTour } = useCompareStore();

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Derived state
  const filteredTours = useMemo(() => {
    if (!tours) return [];
    let filtered = [...tours];

    if (locationParam) {
      const locLower = locationParam.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(locLower) || t.location.toLowerCase().includes(locLower));
    }

    if (destinationParam) {
      filtered = filtered.filter(t => t.destinationId === destinationParam);
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(t => selectedTypes.includes(t.type));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category));
    }

    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
    }

    return filtered;
  }, [tours, locationParam, destinationParam, selectedTypes, selectedCategories, sort]);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
  const paginatedTours = filteredTours.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen pb-[var(--spacing-space-8)]" style={{ background: "var(--bg-main)" }}>
      {/* Search Header */}
      <div className="pb-16 pt-8 px-4 mb-8" style={{ background: "var(--color-ocean-900)" }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-white text-center mb-8"
            style={{ fontSize: "var(--text-display-lg)", lineHeight: "var(--text-display-lg--line-height)" }}>
            {t('tours.searchTitle', 'Tìm kiếm Tour hoàn hảo của bạn')}
          </h1>
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-[var(--spacing-space-8)]">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="rounded-[var(--radius-radius-md)] p-[var(--spacing-space-5)] shadow-[var(--shadow-shadow-sm)] sticky top-24"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
              <div className="flex items-center gap-2 font-display font-semibold mb-6" style={{ fontSize: "var(--text-heading)", color: "var(--text-primary)" }}>
                <Filter className="w-5 h-5" /> Bộ lọc
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3" style={{ fontSize: "var(--text-body)", color: "var(--text-primary)" }}>Loại hình Tour</h3>
                  <div className="space-y-2">
                    {['Group', 'Private'].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTypes([...selectedTypes, type]);
                            else setSelectedTypes(selectedTypes.filter(t => t !== type));
                            setPage(1);
                          }}
                          className="rounded text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)] w-4 h-4"
                        />
                        <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-custom" style={{ fontSize: "var(--text-body)" }}>
                          {type === 'Group' ? 'Ghép đoàn' : 'Riêng tư'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3" style={{ fontSize: "var(--text-body)", color: "var(--text-primary)" }}>Chủ đề</h3>
                  <div className="space-y-2">
                    {['Culture', 'Nature', 'Adventure', 'Relax'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCategories([...selectedCategories, cat]);
                            else setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            setPage(1);
                          }}
                          className="rounded text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)] w-4 h-4"
                        />
                        <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-custom" style={{ fontSize: "var(--text-body)" }}>
                          {cat === 'Culture' ? 'Văn hóa' : cat === 'Nature' ? 'Thiên nhiên' : cat === 'Adventure' ? 'Khám phá' : 'Nghỉ dưỡng'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-heading)" }}>
                Tìm thấy {filteredTours.length} tours
              </h2>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="relative">
                  <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value as 'recommended' | 'price-asc' | 'price-desc' | 'rating')}
                    className="appearance-none border rounded-[var(--radius-radius-sm)] px-4 py-2 pr-10 focus:outline-none transition-custom"
                    style={{ 
                      background: "var(--bg-surface)", 
                      borderColor: "var(--border-main)",
                      color: "var(--text-primary)",
                      fontSize: "var(--text-body)"
                    }}
                  >
                    <option value="recommended">Đề xuất cho bạn</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex rounded-[var(--radius-radius-sm)] overflow-hidden" style={{ border: "1px solid var(--border-main)" }}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className="p-2.5 transition-custom"
                    style={{ 
                      background: viewMode === 'grid' ? "rgba(59,113,254,0.12)" : "var(--bg-surface)",
                      color: viewMode === 'grid' ? "var(--color-ocean-600)" : "var(--text-secondary)"
                    }}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('map')}
                    className="p-2.5 transition-custom"
                    style={{ 
                      background: viewMode === 'map' ? "rgba(59,113,254,0.12)" : "var(--bg-surface)",
                      color: viewMode === 'map' ? "var(--color-ocean-600)" : "var(--text-secondary)",
                      borderLeft: "1px solid var(--border-main)"
                    }}
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--spacing-space-5)]">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="card" className="h-[400px]" />)}
              </div>
            ) : isError ? (
              <DataErrorState onRetry={refetch} message="Không thể tải danh sách tour. Vui lòng thử lại sau." />
            ) : filteredTours.length === 0 ? (
              <div className="rounded-[var(--radius-radius-lg)] p-12 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
                <div className="text-[var(--text-secondary)] mb-4" style={{ fontSize: "var(--text-body-lg)" }}>Không tìm thấy tour nào phù hợp với bộ lọc.</div>
                <Button variant="secondary" onClick={() => { setSelectedTypes([]); setSelectedCategories([]); }}>Xóa bộ lọc</Button>
              </div>
            ) : viewMode === 'map' ? (
              <div className="rounded-[var(--radius-radius-lg)] h-[600px] flex items-center justify-center" style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
                <span className="text-[var(--text-secondary)] flex items-center gap-2" style={{ fontSize: "var(--text-body)" }}>
                  <MapPin className="w-6 h-6" /> Bản đồ đang được cập nhật
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-space-5)]">
                  {paginatedTours.map(tour => (
                    <Card 
                      key={tour.id}
                      variant="tour"
                      image={tour.images[0]}
                      badge={tour.isBestseller ? (
                        <span className="px-2 py-1 rounded-[var(--radius-radius-sm)] text-[10px] font-bold"
                          style={{ background: "var(--color-lantern-500)", color: "var(--color-ink-900)" }}>
                          Bestseller
                        </span>
                      ) : undefined}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/trip/${tour.id}`} className="flex-1">
                          <h3 className="font-display font-semibold text-[var(--text-primary)] hover:text-[var(--color-ocean-600)] transition-custom"
                            style={{ fontSize: "var(--text-heading)" }}>
                            {tour.title}
                          </h3>
                        </Link>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[var(--text-secondary)] mb-3" style={{ fontSize: "var(--text-caption)" }}>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {tour.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tour.durationDays}N {tour.durationNights}Đ</span>
                      </div>
                      
                      <p className="text-[var(--text-secondary)] line-clamp-2 mb-4" style={{ fontSize: "var(--text-body)" }}>
                        {tour.description}
                      </p>
                      
                      <div className="flex items-end justify-between pt-4 mt-auto" style={{ borderTop: "1px solid var(--border-main)" }}>
                        <div>
                          <RatingStars rating={tour.rating} />
                          <div className="text-[var(--text-secondary)] mt-1" style={{ fontSize: "var(--text-caption)" }}>{tour.reviewsCount} đánh giá</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[var(--text-secondary)] mb-1" style={{ fontSize: "var(--text-caption)" }}>Giá từ</div>
                          <div className="font-display font-bold" style={{ fontSize: "var(--text-heading)", color: "var(--color-coral-500)" }}>
                            {tour.price.toLocaleString()} ₫
                          </div>
                        </div>
                      </div>

                      {/* Floating actions over image handled manually since Card doesn't expose inner overlay yet */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-custom">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (toursToCompare.find(t => t.id === tour.id)) removeCompareTour(tour.id);
                            else {
                              if (toursToCompare.length >= 3) toast.error('Chỉ được so sánh tối đa 3 tour');
                              else { addCompareTour(tour); toast.success('Đã thêm vào danh sách so sánh'); }
                            }
                          }}
                          className="p-2 backdrop-blur rounded-full transition-colors flex items-center justify-center"
                          style={{ 
                            background: toursToCompare.find(t => t.id === tour.id) ? "var(--color-ocean-600)" : "rgba(255,255,255,0.7)",
                            color: toursToCompare.find(t => t.id === tour.id) ? "#fff" : "var(--color-ink-900)"
                          }}
                          title="So sánh"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isAuthenticated) {
                              toast.info('Vui lòng đăng nhập để lưu địa điểm yêu thích', {
                                action: { label: 'Đăng nhập', onClick: () => setLoginModalOpen(true) }
                              });
                              return;
                            }
                            toggleTour(tour.id);
                          }}
                          className="p-2 backdrop-blur rounded-full transition-colors flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.7)" }}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(tour.id) ? 'fill-[var(--color-danger)] text-[var(--color-danger)]' : 'text-[var(--color-ink-900)]'}`} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <CompareBar />
    </div>
  );
}
