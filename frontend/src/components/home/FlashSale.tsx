'use client';
﻿import { useEffect, useState } from "react";
import Link from 'next/link';

import { Zap, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else { minutes = 59; if (hours > 0) hours--; }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="rounded-[var(--radius-radius-sm)] px-4 py-2 mb-1 min-w-[3.5rem]"
        style={{ background: "rgba(255,255,255,0.15)" }}>
        {/* Monospace font so digits don't jump — per spec */}
        <span className="font-utility text-2xl font-semibold text-white">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-lantern-500-dark)", opacity: 0.85 }}>
        {label}
      </span>
    </div>
  );

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
                TRIP2024
              </code>{" "}
              giảm ngay 20% cho tất cả tour nội địa trong tháng này.
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
                src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=700&auto=format&fit=crop"
                alt="Đà Nẵng"
                className="w-full h-full object-cover"
                style={{ filter: "saturate(1.05) contrast(1.02)" }}
              />
              {/* Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold"
                style={{ background: "var(--color-coral-500)", color: "#fff" }}>
                −20%
              </div>
            </div>

            <div className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-lantern-500)" }}>HOT DEAL</span>
              <h3 className="font-semibold text-[var(--text-primary)] mt-1 mb-3"
                style={{ fontSize: "var(--text-heading)" }}>
                Combo Đà Nẵng 3N2Đ + Vé máy bay
              </h3>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display font-bold" style={{ fontSize: "var(--text-display-md)", color: "var(--color-coral-500)" }}>
                  3,600,000 ₫
                </span>
                <span className="line-through text-[var(--text-secondary)] text-sm pb-1">4,500,000 ₫</span>
              </div>

              <Button variant="cta" size="md" className="w-full" as={Link} href="/tours">
                Đặt ngay <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
