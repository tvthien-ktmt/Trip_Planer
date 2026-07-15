'use client';
import { useDestinationsQuery } from "../../hooks/queries";
import { Skeleton } from "../common/Skeleton";
import { RouteLine } from "../ui/RouteLine";
import Link from 'next/link';

import { ArrowRight, MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FeaturedDestinations = () => {
  const { t } = useTranslation();
  const { data: destinations, isLoading } = useDestinationsQuery();

  if (isLoading) {
    return (
      <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--bg-main)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Skeleton variant="text" lines={2} width="30%" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-space-5)]">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
        </div>
      </section>
    );
  }

  const featured = [...(destinations || [])].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--bg-main)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[var(--color-ocean-600)] font-semibold text-sm uppercase tracking-wider mb-2">
              Khám phá
            </p>
            <h2 className="font-display font-semibold text-[var(--text-primary)]"
              style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
              {t("home.featuredTitle", "Điểm đến nổi bật")}
            </h2>
            <p className="text-[var(--text-secondary)] mt-2" style={{ fontSize: "var(--text-body)" }}>
              {t("home.featuredSubtitle", "Khám phá vẻ đẹp của Việt Nam và Thế giới")}
            </p>
          </div>
          <Link href="/tours"
            className="hidden sm:flex items-center gap-2 font-semibold text-sm transition-custom hover:gap-3"
            style={{ color: "var(--color-ocean-600)" }}>
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-space-5)]">
          {featured.map((dest) => (
            <Link
              key={dest.id}
              href={`/tours?destination=${dest.id}`}
              className="group relative rounded-[var(--radius-radius-md)] overflow-hidden shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)] transition-custom cursor-pointer flex flex-col"
              style={{ aspectRatio: "4/3" }}
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ filter: "saturate(1.05) contrast(1.02)" }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, rgba(20,20,22,0.80) 0%, rgba(20,20,22,0.1) 60%, transparent 100%)"
              }} />

              {/* Badge: rating */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(232,163,61,0.95)", color: "var(--color-ink-900)" }}>
                <Star className="w-3 h-3 fill-current" /> {dest.rating}
              </div>

              {/* Bottom content: RouteLine + name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <RouteLine variant="card" className="mb-2 opacity-70" color="rgba(232,163,61,0.85)" />
                <h3 className="font-display text-white font-semibold"
                  style={{ fontSize: "var(--text-heading)" }}>
                  {dest.name}
                </h3>
                <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {dest.location}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "view all" link */}
        <div className="sm:hidden mt-6 text-center">
          <Link href="/tours" className="inline-flex items-center gap-2 font-semibold text-sm"
            style={{ color: "var(--color-ocean-600)" }}>
            Xem tất cả điểm đến <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
