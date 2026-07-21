'use client';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from "../../stores";
import { Button } from "../../components/ui/Button";
import { BookingStep } from '../../types';
import { api } from "../../lib/api";

const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const COLS = ["A", "B", "C", "D", "E", "F"];

export default function SeatSelection() {
  const navigate = useRouter();
  const { setStep, updateBookingData, selectedSeats, passengerInfo, selectedOutboundFlightId } = useBookingFlowStore();

  const [currentPassengerId, setCurrentPassengerId] = useState<string>('');
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);

  useEffect(() => { setStep(BookingStep.SEAT); }, [setStep]);

  useEffect(() => {
    // R5-FE-009 fix: Support multi-passenger seat selection
    if (passengerInfo && passengerInfo.length > 0 && !currentPassengerId) {
      const firstPassenger = passengerInfo[0];
      if (firstPassenger?.id) setCurrentPassengerId(firstPassenger.id);
    }
  }, [passengerInfo, currentPassengerId]);

  // Fetch real taken seats from the backend
  useEffect(() => {
    const fetchTakenSeats = async () => {
      if (!selectedOutboundFlightId) {
        setIsLoadingSeats(false);
        return;
      }
      setIsLoadingSeats(true);
      try {
        const res = await api.get(`/flights/${selectedOutboundFlightId}/seats`);
        const seats = res.data?.data || res.data || [];
        const taken = seats
          .filter((s: any) => s.status === 'BOOKED' || s.status === 'LOCKED')
          .map((s: any) => s.seatCode || s.code);
        setTakenSeats(taken);
      } catch (e) {
        setTakenSeats([]); // If error, show all seats as available
      } finally {
        setIsLoadingSeats(false);
      }
    };
    fetchTakenSeats();
  }, [selectedOutboundFlightId]);

  const handleSeatClick = (seatId: string) => {
    if (takenSeats.includes(seatId)) return;
    
    const passengerWithThisSeat = Object.keys(selectedSeats).find(pid => selectedSeats[pid] === seatId);
    
    if (passengerWithThisSeat) {
      if (passengerWithThisSeat === currentPassengerId) {
        const newSeats = { ...selectedSeats };
        delete newSeats[currentPassengerId];
        updateBookingData({ selectedSeats: newSeats });
      }
      return;
    }

    const newSeats = { ...selectedSeats, [currentPassengerId]: seatId };
    updateBookingData({ selectedSeats: newSeats });

    const nextPassenger = passengerInfo.find(p => !newSeats[p.id]);
    if (nextPassenger) {
      setCurrentPassengerId(nextPassenger.id);
    }
  };

  return (
    <div className="rounded-[var(--radius-radius-md)] shadow-[var(--shadow-shadow-sm)] p-6"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
      <h2 className="font-display font-semibold text-[var(--text-primary)] mb-2"
        style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
        Chọn chỗ ngồi
      </h2>
      <p className="text-[var(--text-secondary)] mb-6" style={{ fontSize: "var(--text-body)" }}>
        Chọn ghế cho {Math.max(1, passengerInfo.length)} hành khách
      </p>

      {/* Passenger Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {passengerInfo.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setCurrentPassengerId(p.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentPassengerId === p.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Hành khách {idx + 1}
            {selectedSeats[p.id] && <span className="ml-2 font-bold text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedSeats[p.id]}</span>}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-3 rounded-[var(--radius-radius-sm)]"
        style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
        {[
          { label: "Trống", bg: "var(--bg-surface)", border: "var(--border-main)" },
          { label: "Đang chọn", bg: "var(--color-coral-500)", border: "transparent" },
          { label: "Đã chọn (người khác)", bg: "var(--color-ocean-500)", border: "transparent" },
          { label: "Đã bán", bg: "var(--border-main)", border: "transparent" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px]" style={{ background: s.bg, border: `1px solid ${s.border === "transparent" ? "#0000" : s.border}` }} />
            <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
          </div>
        ))}
        {isLoadingSeats && <span className="text-xs text-blue-500 animate-pulse">Đang tải sơ đồ ghế...</span>}
      </div>

      {/* Plane nose */}
      <div className="max-w-xs mx-auto">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-10 rounded-t-full"
            style={{ background: "var(--border-main)" }} />
        </div>

        {/* Seat grid */}
        <div className="space-y-2 p-4 rounded-[var(--radius-radius-md)]"
          style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
          {/* Column labels */}
          <div className="flex justify-between mb-2 px-1">
            <div className="flex gap-2">
              {COLS.slice(0, 3).map((c) => (
                <div key={c} className="w-9 text-center font-utility text-xs font-semibold text-[var(--text-secondary)]">{c}</div>
              ))}
            </div>
            <div className="w-6" />
            <div className="flex gap-2">
              {COLS.slice(3).map((c) => (
                <div key={c} className="w-9 text-center font-utility text-xs font-semibold text-[var(--text-secondary)]">{c}</div>
              ))}
            </div>
          </div>

          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-between">
              <div className="flex gap-2">
                {COLS.slice(0, 3).map((col) => {
                  const seatId = `${row}${col}`;
                  const isSelectedByMe = selectedSeats[currentPassengerId] === seatId;
                  const isSelectedByOther = Object.keys(selectedSeats).some(pid => pid !== currentPassengerId && selectedSeats[pid] === seatId);
                  const isTaken = takenSeats.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isTaken || isLoadingSeats}
                      aria-label={`Ghế ${seatId}${isTaken ? " - đã bán" : ""}`}
                      className="w-9 h-9 font-utility text-[10px] font-semibold transition-custom rounded-[4px] disabled:cursor-not-allowed"
                      style={{
                        background: isSelectedByMe
                          ? "var(--color-coral-500)"
                          : isSelectedByOther
                          ? "var(--color-ocean-500)"
                          : isTaken
                          ? "var(--border-main)"
                          : "var(--bg-surface)",
                        border: isSelectedByMe || isSelectedByOther || isTaken
                          ? "1px solid transparent"
                          : "1px solid var(--border-main)",
                        color: isSelectedByMe || isSelectedByOther
                          ? "#fff"
                          : isTaken
                          ? "var(--text-secondary)"
                          : "var(--text-primary)",
                        transform: isSelectedByMe ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {seatId}
                    </button>
                  );
                })}
              </div>

              <div className="w-6 text-center font-utility text-xs text-[var(--text-secondary)] font-semibold">{row}</div>

              <div className="flex gap-2">
                {COLS.slice(3).map((col) => {
                  const seatId = `${row}${col}`;
                  const isSelectedByMe = selectedSeats[currentPassengerId] === seatId;
                  const isSelectedByOther = Object.keys(selectedSeats).some(pid => pid !== currentPassengerId && selectedSeats[pid] === seatId);
                  const isTaken = takenSeats.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isTaken || isLoadingSeats}
                      aria-label={`Ghế ${seatId}${isTaken ? " - đã bán" : ""}`}
                      className="w-9 h-9 font-utility text-[10px] font-semibold transition-custom rounded-[4px] disabled:cursor-not-allowed"
                      style={{
                        background: isSelectedByMe
                          ? "var(--color-coral-500)"
                          : isSelectedByOther
                          ? "var(--color-ocean-500)"
                          : isTaken
                          ? "var(--border-main)"
                          : "var(--bg-surface)",
                        border: isSelectedByMe || isSelectedByOther || isTaken
                          ? "1px solid transparent"
                          : "1px solid var(--border-main)",
                        color: isSelectedByMe || isSelectedByOther
                          ? "#fff"
                          : isTaken
                          ? "var(--text-secondary)"
                          : "var(--text-primary)",
                        transform: isSelectedByMe ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {seatId}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={() => navigate.push("/booking/passenger")}>
          Quay lại
        </Button>
        <Button variant="primary" onClick={() => navigate.push("/booking/baggage")}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
