import { useBookingFlowStore } from "../../stores/bookingFlowStore";
import { Check, Plane } from "lucide-react";

const STEPS = [
  { id: 1, name: "Hạng vé", path: "/booking/fare-class" },
  { id: 2, name: "Hành khách", path: "/booking/passenger-info" },
  { id: 3, name: "Chỗ ngồi", path: "/booking/seat-selection" },
  { id: 4, name: "Hành lý", path: "/booking/baggage" },
  { id: 5, name: "Suất ăn", path: "/booking/meal" },
  { id: 6, name: "Dịch vụ", path: "/booking/add-ons" },
  { id: 7, name: "Thanh toán", path: "/booking/payment" },
];

export const BookingProgressBar = () => {
  const { currentStep } = useBookingFlowStore();

  const progressPercent = Math.min(100, ((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="w-full border-b sticky top-0 z-40 py-4 px-4"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
      <div className="max-w-6xl mx-auto">

        {/* Route line progress bar — Signature Element */}
        <div className="relative w-full mb-4">
          {/* Track */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 rounded-full"
            style={{ background: "var(--border-main)" }} />
          {/* Filled progress */}
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%`, background: "var(--color-ocean-900)" }}
          />

          {/* Steps dots + labels */}
          <div className="relative flex justify-between">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center z-10">
                  {/* Dot */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-utility text-xs font-bold transition-all duration-300"
                    style={{
                      background: isCompleted
                        ? "var(--color-ocean-900)"
                        : isCurrent
                        ? "var(--color-lantern-500)"
                        : "var(--bg-surface)",
                      border: isCompleted || isCurrent
                        ? "none"
                        : "2px solid var(--border-main)",
                      color: isCompleted || isCurrent ? "#fff" : "var(--text-secondary)",
                      transform: isCurrent ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>

                  {/* Label */}
                  <span className="mt-2 text-[10px] font-medium whitespace-nowrap hidden sm:block transition-custom"
                    style={{ color: isCompleted || isCurrent ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Plane icon moving along the progress */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-20"
            style={{ left: `calc(${progressPercent}% - 12px)` }}
            aria-hidden="true"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-ocean-900)" }}>
              <Plane className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Current step name on mobile */}
        <p className="sm:hidden text-center font-medium"
          style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>
          Bước {currentStep}/{STEPS.length}: {STEPS.find(s => s.id === currentStep)?.name}
        </p>
      </div>
    </div>
  );
};
