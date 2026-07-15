import Link from 'next/link';

import { useSearchFlightStore } from "../../../stores";
import { useSearchFlightsQuery } from "../../../hooks/queries/useFlightQueries";
import { Plane, Filter } from "lucide-react";
import { DataErrorState } from "../../../components/common/DataErrorState";
import { Button } from "../../../components/ui/Button";
import { RouteLine } from "../../../components/ui/RouteLine";

export default function FlightResults() {
  const { departure, destination, departureDate } = useSearchFlightStore();
  
  const { data: flights = [], isLoading, isError, refetch } = useSearchFlightsQuery({
    departureAirportCode: departure,
    arrivalAirportCode: destination,
    departureDate: departureDate || undefined
  });

  return (
    <div className="min-h-screen py-[var(--spacing-space-8)]" style={{ background: "var(--bg-main)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-[var(--spacing-space-8)]">
        
        {/* Sidebar Filter */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="rounded-[var(--radius-radius-md)] p-[var(--spacing-space-5)] shadow-[var(--shadow-shadow-sm)] sticky top-24"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
            <div className="flex items-center gap-2 font-display font-semibold mb-6" style={{ fontSize: "var(--text-heading)", color: "var(--text-primary)" }}>
              <Filter className="w-5 h-5" /> Bộ lọc
            </div>
            <p className="text-[var(--text-secondary)] text-[var(--text-body)]">Bộ lọc đang được phát triển...</p>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="rounded-[var(--radius-radius-md)] p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
            <div>
              <h1 className="font-display font-bold text-[var(--text-primary)] flex items-center gap-3"
                style={{ fontSize: "var(--text-heading)" }}>
                {departure || "Tất cả"}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-mist-50)" }}>
                  <Plane className="w-4 h-4" style={{ color: "var(--color-ocean-900)" }} />
                </div>
                {destination || "Tất cả"}
              </h1>
              <p className="text-[var(--text-secondary)] mt-1" style={{ fontSize: "var(--text-body)" }}>
                {flights.length} chuyến bay được tìm thấy
              </p>
            </div>
            <Link href="/flights/search" className="font-semibold text-sm transition-custom hover:underline"
              style={{ color: "var(--color-ocean-600)" }}>
              Thay đổi tìm kiếm
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">Đang tìm chuyến bay...</div>
          ) : isError ? (
            <div className="mt-8">
              <DataErrorState onRetry={refetch} message="Không thể tải danh sách chuyến bay. Vui lòng thử lại sau." />
            </div>
          ) : flights.length > 0 ? (
            <div className="space-y-[var(--spacing-space-5)]">
              {flights.map(flight => (
                <div key={flight.id} className="group rounded-[var(--radius-radius-md)] p-[var(--spacing-space-5)] shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)] transition-custom flex flex-col md:flex-row gap-6"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
                  
                  {/* Left: Flight Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <img src={flight.legs[0].airlineLogo} alt={`${flight.legs[0].airline} Logo`} className="w-8 h-8 object-contain" />
                      <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>
                        {flight.legs[0].airline}
                      </span>
                    </div>

                    <div className="flex items-center justify-between group-hover:px-2 transition-all duration-300">
                      {/* Departure */}
                      <div className="text-center">
                        <div className="font-utility font-bold text-[var(--text-primary)] text-2xl">
                          {new Date(flight.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="font-utility text-sm text-[var(--text-secondary)] mt-1">
                          {flight.departureAirportCode}
                        </div>
                      </div>

                      {/* Route Line */}
                      <div className="flex-1 px-8 flex flex-col items-center">
                        <div className="text-xs text-[var(--text-secondary)] mb-2">
                          {Math.floor(flight.totalDurationMinutes / 60)}h {flight.totalDurationMinutes % 60}m
                        </div>
                        <RouteLine variant="card" color="var(--color-ocean-600)" className="w-full" />
                        <div className="text-xs font-semibold mt-2" style={{ color: "var(--color-ocean-600)" }}>
                          {flight.legs.length === 1 ? "Bay thẳng" : `${flight.legs.length - 1} điểm dừng`}
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-center">
                        <div className="font-utility font-bold text-[var(--text-primary)] text-2xl">
                          {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="font-utility text-sm text-[var(--text-secondary)] mt-1">
                          {flight.arrivalAirportCode}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Pricing & CTA */}
                  <div className="md:w-56 md:pl-6 flex flex-col justify-center"
                    style={{ borderLeft: "1px dashed var(--border-main)" }}>
                    <div className="text-[var(--text-secondary)] text-sm mb-1 text-center md:text-right">Giá từ</div>
                    <div className="font-display font-bold text-center md:text-right mb-4"
                      style={{ color: "var(--color-coral-500)", fontSize: "var(--text-heading)" }}>
                      {flight.pricing[0].price.toLocaleString()} ₫
                    </div>
                    <Button variant="cta" as={Link} href={`/flights/${flight.id}`} className="w-full">
                      Chọn chuyến bay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-radius-md)] p-12 text-center"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
              <h2 className="font-display font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: "var(--text-heading)" }}>
                Không tìm thấy chuyến bay nào
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 text-sm">
                Thử thay đổi ngày bay hoặc sân bay khác để tìm được chuyến bay phù hợp.
              </p>
              <Button as={Link} href="/flights/search" variant="primary">
                Tìm kiếm lại
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
