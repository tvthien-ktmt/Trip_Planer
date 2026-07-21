'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-[var(--radius-radius-md)] min-w-[60px] shadow-sm">
    <span className="text-xl font-bold font-utility text-[var(--color-danger)]">{value.toString().padStart(2, '0')}</span>
    <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
  </div>
);

export const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [tour, setTour] = useState<any>(null);
  const [promo, setPromo] = useState<{ code: string; expiresAt: string; discountPercent: number } | null>(null);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const [tourRes, promoRes] = await Promise.all([
          api.get('/tours?limit=1'),
          api.get('/vouchers/flash-sale')
        ]);
        
        const tourData = tourRes.data?.data || tourRes.data;
        if (tourData && tourData.length > 0) {
          setTour(tourData[0]);
        }

        const promoData = promoRes.data?.data;
        if (promoData) {
          setPromo(promoData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFlashSale();
  }, []);

  useEffect(() => {
    if (!promo?.expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(promo.expiresAt) - +new Date();
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [promo]);

  if (!tour) return null;

  return (
    <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--color-ocean-900)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Left: Banner text + countdown */}
          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: "rgba(240,101,74,0.20)", border: "1px solid rgba(240,101,74,0.40)" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--color-coral-500)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--color-coral-500)" }}>
                Ưu đãi hôm nay
              </span>
            </div>

            <h2 className="font-display font-semibold text-white mb-3"
              style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
              Ưu đãi độc quyền hôm nay!
            </h2>
            <p className="text-white/70 mb-6" style={{ fontSize: "var(--text-body)" }}>
              Nhập mã{" "}
              <code className="font-utility font-semibold px-2 py-0.5 rounded-[4px]"
                style={{ background: "var(--color-lantern-500)", color: "var(--color-ink-900)" }}>
                {promo?.code || 'TRIP2024'}
              </code>{" "}
              giảm ngay {promo?.discountPercent || 20}% cho chuyến đi này.
            </p>

            {/* Countdown — monospace font */}
            <div className="flex items-center gap-3">
              <TimeUnit value={timeLeft.hours} label="Giờ" />
              <span className="text-white/50 text-2xl font-bold pb-5">:</span>
              <TimeUnit value={timeLeft.minutes} label="Phút" />
              <span className="text-white/50 text-2xl font-bold pb-5">:</span>
              <TimeUnit value={timeLeft.seconds} label="Giây" />
            </div>
          </div>

          {/* Right: Deal card */}
          <div className="w-full lg:w-auto lg:min-w-[400px] rounded-[var(--radius-radius-md)] overflow-hidden shadow-[var(--shadow-shadow-lg)]"
            style={{ background: "var(--bg-surface)" }}>
            <div className="relative h-44 overflow-hidden">
              <img
                src={tour.coverImage || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=700&auto=format&fit=crop"}
                alt={tour.title}
                className="w-full h-full object-cover"
                style={{ filter: "saturate(1.05) contrast(1.02)" }}
              />
              {/* Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold"
                style={{ background: "var(--color-coral-500)", color: "#fff" }}>
                −{promo?.discountPercent || 20}%
              </div>
            </div>

            <div className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-lantern-500)" }}>HOT DEAL</span>
              <h3 className="font-semibold text-[var(--text-primary)] mt-1 mb-3"
                style={{ fontSize: "var(--text-heading)" }}>
                {tour.title}
              </h3>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display font-bold" style={{ fontSize: "var(--text-display-md)", color: "var(--color-coral-500)" }}>
                  {(Number(tour.basePrice) * (1 - (promo?.discountPercent || 20)/100)).toLocaleString()} ₫
                </span>
                <span className="line-through text-[var(--text-secondary)] text-sm pb-1">{(Number(tour.basePrice)).toLocaleString()} ₫</span>
              </div>

              <Button variant="cta" size="md" className="w-full" as={Link} href={`/tours/${tour.id}`}>
                Đặt ngay <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
