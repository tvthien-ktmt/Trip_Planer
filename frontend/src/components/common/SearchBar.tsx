'use client';
import { useState } from "react";
import { useSearchStore, useSearchFlightStore } from "../../stores";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AirportAutocomplete } from "../form/AirportAutocomplete";
import { DatePickerRange } from "../form/DatePickerRange";
import { DestinationAutocomplete } from "../form/DestinationAutocomplete";
import { Button } from "../ui/Button";

export const SearchBar = () => {
  const { location, setLocation, pax } = useSearchStore();
  const searchFlightStore = useSearchFlightStore();
  const [activeTab, setActiveTab] = useState<"hotels" | "tours" | "flights" | "activities">("flights");
  const navigate = useRouter();

  const handleSearch = () => {
    if (activeTab === "flights") {
      if (!searchFlightStore.departure || !searchFlightStore.destination) {
        alert("Vui lòng chọn điểm đi và điểm đến");
        return;
      }
      navigate.push("/flights/results");
    } else {
      navigate.push(`/tours?location=${encodeURIComponent(location)}`);
    }
  };

  const tabs = [
    { id: "hotels", label: "Khách sạn" },
    { id: "tours", label: "Tours & Trải nghiệm" },
    { id: "flights", label: "Vé máy bay" },
    { id: "activities", label: "Hoạt động" },
  ] as const;

  return (
    <div className="rounded-[var(--radius-radius-lg)] shadow-[var(--shadow-shadow-xl)] p-4 sm:p-6 w-full max-w-5xl mx-auto text-left"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
      {/* Tabs */}
      <div className="flex gap-6 mb-6" style={{ borderBottom: "1px solid var(--border-main)" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-semibold text-sm transition-colors relative ${
              activeTab === tab.id 
                ? "text-[var(--color-ocean-600)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-md"
                style={{ background: "var(--color-ocean-600)" }} />
            )}
          </button>
        ))}
      </div>

      {activeTab === "flights" ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="heroTripType" 
                checked={searchFlightStore.tripType === "round-trip"} 
                onChange={() => searchFlightStore.setSearch({ tripType: "round-trip" })}
                className="text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)]"
              />
              <span className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[var(--color-ocean-600)] transition-colors">Khứ hồi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="heroTripType" 
                checked={searchFlightStore.tripType === "one-way"} 
                onChange={() => searchFlightStore.setSearch({ tripType: "one-way" })}
                className="text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)]"
              />
              <span className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[var(--color-ocean-600)] transition-colors">Một chiều</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="w-full min-w-0">
              <AirportAutocomplete 
                label="Từ"
                placeholder="Sân bay đi"
                value={searchFlightStore.departure}
                onChange={(code) => searchFlightStore.setSearch({ departure: code })}
              />
            </div>
            <div className="w-full min-w-0">
              <AirportAutocomplete 
                label="Đến"
                placeholder="Sân bay đến"
                value={searchFlightStore.destination}
                onChange={(code) => searchFlightStore.setSearch({ destination: code })}
              />
            </div>
            <div className="w-full min-w-0 md:col-span-2 lg:col-span-2">
              <DatePickerRange 
                label="Ngày bay"
                departureDate={searchFlightStore.departureDate}
                returnDate={searchFlightStore.returnDate}
                onChangeDeparture={(date) => searchFlightStore.setSearch({ departureDate: date })}
                onChangeReturn={(date) => searchFlightStore.setSearch({ returnDate: date })}
                tripType={searchFlightStore.tripType}
              />
            </div>
            <div className="w-full min-w-0 md:col-span-2 lg:col-span-1">
              <Button 
                variant="primary"
                size="lg"
                onClick={handleSearch}
                className="w-full h-[50px] px-8 flex-shrink-0 whitespace-nowrap"
                leftIcon={<Search className="w-5 h-5" />}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Location */}
          <div className="w-full min-w-0 rounded-[var(--radius-radius-md)] p-3 flex items-center gap-3 transition-colors hover:border-[var(--color-ocean-400)] cursor-text"
            style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
            <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium block" style={{ color: "var(--text-secondary)" }}>Điểm đến</label>
              <DestinationAutocomplete 
                value={location}
                onChange={setLocation}
              />
            </div>
          </div>

          {/* Date */}
          <div className="w-full min-w-0 rounded-[var(--radius-radius-md)] p-3 flex items-center gap-3 transition-colors hover:border-[var(--color-ocean-400)] cursor-pointer"
            style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
            <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium block truncate" style={{ color: "var(--text-secondary)" }}>Ngày đi - Ngày về</label>
              <input 
                type="text" 
                placeholder="Thêm ngày" 
                readOnly
                className="w-full min-w-0 bg-transparent border-none outline-none font-semibold cursor-pointer truncate"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Pax */}
          <div className="w-full min-w-0 rounded-[var(--radius-radius-md)] p-3 flex items-center gap-3 transition-colors hover:border-[var(--color-ocean-400)] cursor-pointer"
            style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)" }}>
            <Users className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium block truncate" style={{ color: "var(--text-secondary)" }}>Khách & Phòng</label>
              <div className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {pax.adults} người lớn{pax.children > 0 ? `, ${pax.children} trẻ em` : ""}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="w-full min-w-0 md:col-span-2 lg:col-span-1">
            <Button 
              variant="primary"
              size="lg"
              onClick={handleSearch}
              className="w-full h-[60px] px-8 flex-shrink-0 whitespace-nowrap"
              leftIcon={<Search className="w-5 h-5 flex-shrink-0" />}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
