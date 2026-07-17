'use client';
﻿import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from "../../stores";
import { Button } from "../../components/ui/Button";

const TAKEN_SEATS = ["1A", "2C", "3E", "4B", "5D", "6A", "7F", "2E"];
const ROWS = [1, 2, 3, 4, 5, 6, 7];
const COLS = ["A", "B", "C", "D", "E", "F"];

export default function SeatSelection() {
  const navigate = useRouter();
  const { setStep, updateBookingData, selectedSeats, passengerInfo } = useBookingFlowStore();

  useEffect(() => { setStep(3); }, [setStep]);

  const handleSeatClick = (seatId: string) => {
    if (TAKEN_SEATS.includes(seatId)) return;
    const currentSeat = selectedSeats["0"];
    if (currentSeat === seatId) {
      const newSeats = { ...selectedSeats };
      delete newSeats["0"];
      updateBookingData({ selectedSeats: newSeats });
    } else {
      updateBookingData({ selectedSeats: { ...selectedSeats, "0": seatId } });
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-3 rounded-[var(--radius-radius-sm)]"
        style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
        {[
          { label: "Trống", bg: "var(--bg-surface)", border: "var(--border-main)", text: "var(--text-secondary)" },
          { label: "Đã chọn", bg: "var(--color-coral-500)", border: "transparent", text: "#fff" },
          { label: "Đã bán", bg: "var(--border-main)", border: "transparent", text: "var(--text-secondary)" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px]" style={{ background: s.bg, border: `1px solid ${s.border === "transparent" ? "none" : s.border}` }} />
            <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
          </div>
        ))}
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
                  const isSelected = selectedSeats["0"] === seatId;
                  const isTaken = TAKEN_SEATS.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isTaken}
                      aria-label={`Ghế ${seatId}${isTaken ? " - đã bán" : isSelected ? " - đã chọn" : " - trống"}`}
                      className="w-9 h-9 font-utility text-[10px] font-semibold transition-custom rounded-[4px] disabled:cursor-not-allowed"
                      style={{
                        background: isSelected
                          ? "var(--color-coral-500)"
                          : isTaken
                          ? "var(--border-main)"
                          : "var(--bg-surface)",
                        border: isSelected || isTaken
                          ? "1px solid transparent"
                          : "1px solid var(--border-main)",
                        color: isSelected
                          ? "#fff"
                          : isTaken
                          ? "var(--text-secondary)"
                          : "var(--text-primary)",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
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
                  const isSelected = selectedSeats["0"] === seatId;
                  const isTaken = TAKEN_SEATS.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isTaken}
                      aria-label={`Ghế ${seatId}${isTaken ? " - đã bán" : isSelected ? " - đã chọn" : " - trống"}`}
                      className="w-9 h-9 font-utility text-[10px] font-semibold transition-custom rounded-[4px] disabled:cursor-not-allowed"
                      style={{
                        background: isSelected
                          ? "var(--color-coral-500)"
                          : isTaken
                          ? "var(--border-main)"
                          : "var(--bg-surface)",
                        border: isSelected || isTaken
                          ? "1px solid transparent"
                          : "1px solid var(--border-main)",
                        color: isSelected
                          ? "#fff"
                          : isTaken
                          ? "var(--text-secondary)"
                          : "var(--text-primary)",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
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

        {selectedSeats["0"] && (
          <p className="mt-4 text-center text-sm font-medium" style={{ color: "var(--color-ocean-600)" }}>
            Đã chọn: Ghế <span className="font-utility font-bold">{selectedSeats["0"]}</span>
          </p>
        )}
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
