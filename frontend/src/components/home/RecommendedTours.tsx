import { useToursQuery } from "../../hooks/queries";
import { Skeleton } from "../common/Skeleton";
import { RouteLine } from "../ui/RouteLine";
import { PriceTag } from "../common/PriceTag";
import { RatingStars } from "../common/RatingStars";
import { DataErrorState } from "../common/DataErrorState";
import { Heart, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from 'next/link';

import { useWishlistStore } from "../../stores";
import { Button } from "../ui/Button";
import { routes } from '../../lib/routes';

export const RecommendedTours = () => {
  const { data: tours, isLoading, isError, refetch } = useToursQuery();
  const { tourIds: wishlist, toggleTour } = useWishlistStore();

  if (isLoading) {
    return (
      <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10"><Skeleton variant="text" lines={2} width="30%" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-space-5)]">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <DataErrorState onRetry={refetch} message="Không thể tải danh sách tour. Vui lòng thử lại sau." />
        </div>
      </section>
    );
  }

  const recommended = tours?.filter((t) => t.isBestseller).slice(0, 3) || [];

  return (
    <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[var(--color-coral-500)] font-semibold text-sm uppercase tracking-wider mb-2">
              Bán chạy nhất
            </p>
            <h2 className="font-display font-semibold text-[var(--text-primary)]"
              style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
              Tour được đề xuất
            </h2>
            <p className="text-[var(--text-secondary)] mt-2">Những hành trình được yêu thích nhất</p>
          </div>
          <Link href="/tours" className="hidden sm:flex items-center gap-2 font-semibold text-sm transition-custom hover:gap-3"
            style={{ color: "var(--color-ocean-600)" }}>
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card grid — 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-space-5)]">
          {recommended.map((tour) => (
            <article key={tour.id}
              className="group flex flex-col rounded-[var(--radius-radius-md)] overflow-hidden shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)] transition-custom"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>

              {/* Image — 4:3 ratio */}
              <div className="relative overflow-hidden" style={{ paddingTop: "75%" }}>
                <img
                  src={tour.images[0]}
                  alt={tour.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ filter: "saturate(1.05) contrast(1.02)" }}
                />
                {/* Wishlist button */}
                <button
                  onClick={(e) => { e.preventDefault(); toggleTour(tour.id); }}
                  className="absolute top-3 right-3 p-2 rounded-full transition-custom hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
                  aria-label={wishlist.includes(tour.id) ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  <Heart className={`w-4 h-4 transition-custom ${wishlist.includes(tour.id) ? "fill-current" : ""}`}
                    style={{ color: wishlist.includes(tour.id) ? "var(--color-coral-500)" : "var(--color-ink-500)" }} />
                </button>

                {/* Badge */}
                {tour.isDiscounted && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold"
                    style={{ background: "var(--color-lantern-500)", color: "var(--color-ink-900)" }}>
                    Giảm giá
                  </div>
                )}

                {/* RouteLine overlay on hover */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-custom">
                  <RouteLine variant="card" color="rgba(232,163,61,0.9)" />
                </div>
              </div>

              {/* Content */}
              <div className="p-[var(--spacing-space-5)] flex-1 flex flex-col">
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5" /> {tour.location}
                </p>

                <Link href={routes.tourDetail(tour.id)}>
                  <h3 className="font-semibold text-[var(--text-primary)] leading-snug mb-3 transition-custom group-hover:text-[var(--color-ocean-600)]"
                    style={{ fontSize: "var(--text-heading)" }}>
                    {tour.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                  <RatingStars rating={tour.rating} />
                  <span className="text-[var(--text-secondary)]" style={{ fontSize: "var(--text-caption)" }}>
                    ({tour.reviewsCount})
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-4 pb-4"
                  style={{ borderBottom: "1px solid var(--border-main)" }}>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: "var(--color-ocean-600)" }} />
                    {tour.durationDays}N {tour.durationNights}Đ
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: "var(--color-mist-50)", color: "var(--color-ink-500)" }}>
                    {tour.type === "Group" ? "Ghép đoàn" : "Riêng tư"}
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-[var(--text-secondary)] mb-1" style={{ fontSize: "var(--text-micro)" }}>Giá từ</p>
                    <div className="flex items-end gap-2">
                      <PriceTag amount={tour.price} className="text-xl font-bold" />
                      {tour.oldPrice && <PriceTag amount={tour.oldPrice} isOldPrice />}
                    </div>
                  </div>
                  <Button variant="primary" size="sm" as={Link} href={routes.tourDetail(tour.id)}>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden mt-6 text-center">
          <Link href="/tours" className="inline-flex items-center gap-2 font-semibold text-sm"
            style={{ color: "var(--color-ocean-600)" }}>
            Xem tất cả tour <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
