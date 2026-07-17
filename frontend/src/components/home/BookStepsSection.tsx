import { MapPin, Calendar, CreditCard, CheckCircle } from "lucide-react";
import { RouteLine } from "../ui/RouteLine";

const steps = [
  {
    icon: MapPin,
    color: "var(--color-lantern-500)",
    title: "Chọn điểm đến",
    desc: "Tìm kiếm chuyến bay, tour hoặc khách sạn theo điểm đến, ngày khởi hành và số lượng hành khách.",
  },
  {
    icon: Calendar,
    color: "var(--color-coral-500)",
    title: "Điền thông tin",
    desc: "Cung cấp thông tin hành khách, chọn hạng vé, ghế ngồi và các dịch vụ bổ sung theo nhu cầu.",
  },
  {
    icon: CreditCard,
    color: "var(--color-ocean-600)",
    title: "Thanh toán & Lên đường",
    desc: "Thanh toán an toàn qua nhiều phương thức. Nhận vé điện tử ngay lập tức và chuẩn bị hành trình!",
  },
];

export const BookStepsSection = () => {
  return (
    <section className="py-[var(--spacing-space-8)]" style={{ background: "var(--bg-main)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-space-8)] items-center">

          {/* Left: Steps */}
          <div>
            <p className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: "var(--color-ocean-600)" }}>
              Dễ dàng & Nhanh chóng
            </p>
            <h2 className="font-display font-semibold text-[var(--text-primary)] mb-10"
              style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
              Đặt chuyến đi tiếp theo<br />
              chỉ trong 3 bước
            </h2>

            <div className="space-y-8">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex gap-5 group">
                    {/* Icon + connecting route line */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-[var(--radius-radius-sm)] flex items-center justify-center flex-shrink-0 transition-custom group-hover:scale-110"
                        style={{ background: step.color }}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      {idx < steps.length - 1 && (
                        <RouteLine variant="timeline" className="flex-1 mt-2" color={steps[idx + 1]?.color} />
                      )}
                    </div>
                    <div className="pb-8">
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1"
                        style={{ fontSize: "var(--text-heading)" }}>
                        {step.title}
                      </h4>
                      <p className="text-[var(--text-secondary)]" style={{ fontSize: "var(--text-body)" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Visual preview card */}
          <div className="relative flex justify-center">
            {/* Glow aura */}
            <div className="absolute inset-0 rounded-full blur-3xl opacity-20 -z-10"
              style={{ background: "var(--color-ocean-600)" }} />

            {/* Booking card mockup */}
            <div className="rounded-[var(--radius-radius-md)] shadow-[var(--shadow-shadow-lg)] w-full max-w-sm"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
              {/* Image */}
              <div className="relative rounded-t-[var(--radius-radius-md)] overflow-hidden" style={{ height: "180px" }}>
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop"
                  alt="Điểm đến - Đà Nẵng, Việt Nam"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to top, rgba(20,20,22,0.6) 0%, transparent 60%)"
                }} />
                <p className="absolute bottom-3 left-4 text-white font-semibold font-display">Đà Nẵng, Việt Nam</p>
              </div>

              <div className="p-5">
                {/* Route line */}
                <RouteLine variant="card" className="mb-4" color="var(--color-ocean-600)" />

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">Khởi hành</p>
                    <p className="font-semibold text-[var(--text-primary)] font-utility text-sm">14 Tháng 8, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">Tổng cộng</p>
                    <p className="font-display font-bold" style={{ color: "var(--color-coral-500)", fontSize: "var(--text-heading)" }}>
                      3,600,000 ₫
                    </p>
                  </div>
                </div>

                {/* Confirmed badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-radius-sm)]"
                  style={{ background: "var(--color-mist-50)", border: "1px solid var(--border-main)" }}>
                  <CheckCircle className="w-4 h-4" style={{ color: "var(--color-ocean-600)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-ocean-900)" }}>
                    Đặt chỗ đã được xác nhận
                  </span>
                </div>
              </div>
            </div>

            {/* Floating passengers avatars */}
            <div className="absolute -top-4 -right-4 rounded-[var(--radius-radius-md)] px-4 py-3 shadow-[var(--shadow-shadow-md)]"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Hành khách</p>
              <div className="flex -space-x-2">
                {["https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"].map((src, i) => (
                  <img key={i} src={src} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "var(--color-ocean-600)", color: "#fff" }}>+4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
