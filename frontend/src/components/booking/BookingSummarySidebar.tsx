import { useBookingFlowStore } from "../../stores";
import { Plane, Users, CheckCircle, Ticket } from "lucide-react";
import { RouteLine } from "../ui/RouteLine";

export const BookingSummarySidebar = () => {
  const { outboundFareClass, passengerInfo, selectedSeats } = useBookingFlowStore();

  const basePrice = 3600000;
  const numPassengers = Math.max(1, passengerInfo.length);
  const seatsPrice = Object.keys(selectedSeats).length * 150000; // Demo
  const total = basePrice * numPassengers + seatsPrice;

  return (
    <div className="w-full lg:w-[360px] flex-shrink-0">
      <div className="rounded-[var(--radius-radius-md)] p-5 sticky top-24"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-lg)" }}>
        
        <h3 className="font-display font-semibold mb-4" style={{ fontSize: "var(--text-heading)", color: "var(--text-primary)" }}>
          Tóm tắt chuyến đi
        </h3>

        {/* Flight summary */}
        <div className="pb-4 mb-4" style={{ borderBottom: "1px dashed var(--border-main)" }}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-[var(--radius-radius-sm)] flex items-center justify-center"
              style={{ background: "var(--color-mist-50)" }}>
              <Plane className="w-5 h-5" style={{ color: "var(--color-ocean-900)" }} />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">SGN → HAN</p>
              <p className="text-[var(--text-secondary)] text-sm">20 Tháng 10, 2026</p>
            </div>
          </div>
          <div className="pl-14">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Ticket className="w-3.5 h-3.5" /> Hạng vé: {outboundFareClass || "Chưa chọn"}
            </div>
          </div>
        </div>

        {/* Passengers & Add-ons */}
        <div className="pb-4 mb-4 space-y-3" style={{ borderBottom: "1px dashed var(--border-main)" }}>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)] flex items-center gap-1">
              <Users className="w-4 h-4" /> Hành khách ({numPassengers})
            </span>
            <span className="font-semibold text-[var(--text-primary)] font-utility">
              {(basePrice * numPassengers).toLocaleString()} ₫
            </span>
          </div>
          
          {Object.keys(selectedSeats).length > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Chọn ghế ({Object.keys(selectedSeats).length})
              </span>
              <span className="font-semibold text-[var(--text-primary)] font-utility">
                {seatsPrice.toLocaleString()} ₫
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-[var(--text-primary)] font-semibold">Tổng cộng</span>
            <span className="font-display font-bold" style={{ fontSize: "var(--text-display-md)", color: "var(--color-coral-500)" }}>
              {total.toLocaleString()} ₫
            </span>
          </div>
          <p className="text-right text-[10px] text-[var(--text-secondary)]">Đã bao gồm thuế & phí</p>
        </div>

        <RouteLine variant="card" className="mt-4 opacity-50" color="var(--color-ocean-900)" />
      </div>
    </div>
  );
};
