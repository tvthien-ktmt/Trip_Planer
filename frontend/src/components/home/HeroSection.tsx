'use client';
import { SearchBar } from "../common/SearchBar";
import { useTranslation } from "react-i18next";
import { RouteLine } from "../ui/RouteLine";
import { MapPin, TrendingUp } from "lucide-react";

const TRENDING = ["Đà Lạt", "Hội An", "Phú Quốc", "Hạ Long", "Tokyo"];

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative" style={{ minHeight: "88vh", background: "var(--color-ocean-900)" }}>

      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ filter: "saturate(1.05) contrast(1.02)" }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(105deg, rgba(20,20,22,0.90) 0%, rgba(20,20,22,0.65) 45%, rgba(20,20,22,0.2) 100%)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(20,20,22,0.8) 0%, transparent 50%)" }} />
      </div>

      {/* Content - asymmetric 55/45 layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center min-h-[88vh]">

        {/* Left: 55% - Text + Search */}
        <div className="w-full lg:w-[55%] py-24 lg:py-0 flex flex-col justify-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit"
            style={{ background: "rgba(232,163,61,0.20)", border: "1px solid rgba(232,163,61,0.40)" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--color-lantern-500)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--color-lantern-500)" }}>
              Hơn 50,000 chuyến đi mỗi ngày
            </span>
          </div>

          {/* H1 */}
          <h1
            className="font-display font-semibold text-white mb-4"
            style={{ fontSize: "var(--text-display-xl)", lineHeight: "var(--text-display-xl--line-height)" }}
          >
            {t("home.searchTitle")}
          </h1>

          <p className="text-white/70 mb-8 max-w-md"
            style={{ fontSize: "var(--text-body-lg)", lineHeight: "var(--text-body-lg--line-height)" }}>
            Cầu nối giữa vẻ đẹp Việt Nam và sự rộng lớn của thế giới.
            Đặt vé, tour, khách sạn - chỉ trong một nơi.
          </p>

          {/* Search bar */}
          <div className="w-full relative z-30">
            <SearchBar />
          </div>

          {/* Trending destinations */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="text-white/50 text-sm flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Xu hướng:
            </span>
            {["Đà Lạt", "Hội An", "Phú Quốc", "Hạ Long", "Tokyo"].map((dest) => (
              <a
                key={dest}
                href="/tours"
                className="flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium transition-custom hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)", border: "1px solid rgba(255,255,255,0.20)" }}
              >
                <MapPin className="w-3 h-3" />
                {dest}
              </a>
            ))}
          </div>
        </div>

        {/* Right: 45%  Hero image card */}
        <div className="hidden lg:flex w-[45%] justify-end pl-12 py-24 relative z-20">
          <div className="relative w-full max-w-md">
            {/* Main image card */}
            <div className="rounded-[var(--radius-radius-lg)] overflow-hidden shadow-[var(--shadow-shadow-lg)] aspect-[4/5] relative">
              <img
                src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=700&auto=format&fit=crop"
                alt="Hội An, Việt Nam"
                className="w-full h-full object-cover"
                style={{ filter: "saturate(1.05) contrast(1.02)" }}
              />
              {/* Gradient on image */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(20,20,22,0.7) 0%, transparent 50%)" }} />

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <RouteLine variant="card" className="mb-2" color="rgba(232,163,61,0.85)" />
                <p className="text-white font-semibold font-display text-lg">Hội An, Việt Nam</p>
                <p className="text-white/70 text-sm">Từ 1,500,000 ₫</p>
              </div>
            </div>


            {/* Top badge */}
            <div className="absolute -top-4 -right-4 rounded-[var(--radius-radius-md)] px-3 py-2 shadow-[var(--shadow-shadow-md)]"
              style={{ background: "var(--color-lantern-500)" }}>
              <p className="text-xs font-bold text-[var(--color-ink-900)]">HOT DEAL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20"
        style={{ background: "rgba(20,20,22,0.85)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center lg:justify-between gap-6 text-center">
            {[
              { value: "50K+", label: "Chuyến đi mỗi ngày" },
              { value: "180+", label: "Điểm đến" },
              { value: "4.9+", label: "Đánh giá trung bình" },
              { value: "24/7", label: "Hỗ trợ khách hàng" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
