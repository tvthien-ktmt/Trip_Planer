'use client';
import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useAirportsQuery } from '../../hooks/queries/useFlightQueries';

interface AirportAutocompleteProps {
  label: string;
  placeholder: string;
  value: string; // airport code
  onChange: (code: string) => void;
}

export const AirportAutocomplete = ({ label, placeholder, value, onChange }: AirportAutocompleteProps) => {
  const { data: airports = [], isLoading } = useAirportsQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value to display text
  useEffect(() => {
    const selected = airports.find(a => a.code === value);
    if (selected) {
      setSearchTerm(`${selected.city} (${selected.code})`);
    } else {
      setSearchTerm('');
    }
  }, [value, airports]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAirports = airports.filter(a => 
    a.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-[11px] rounded-[var(--radius-radius-sm)] focus:outline-none transition-custom"
          style={{ 
            background: "var(--bg-main)", 
            border: "1px solid var(--border-main)",
            color: "var(--text-primary)",
            fontSize: "var(--text-body)"
          }}
          placeholder={placeholder}
          value={isOpen ? searchTerm : (airports.find(a => a.code === value) ? `${airports.find(a => a.code === value)?.city} (${value})` : searchTerm)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-ocean-600)"; setIsOpen(true); }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border-main)"; }}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-[var(--radius-radius-sm)] shadow-[var(--shadow-shadow-lg)] max-h-64 overflow-y-auto"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
          {isLoading ? (
            <div className="p-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Đang tải...</div>
          ) : filteredAirports.length > 0 ? (
            <ul>
              {filteredAirports.map(airport => (
                <li 
                  key={airport.id}
                  className="px-4 py-3 cursor-pointer transition-colors flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border-main)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-main)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => {
                    onChange(airport.code);
                    setSearchTerm(`${airport.city} (${airport.code})`);
                    setIsOpen(false);
                  }}
                >
                  <div>
                    <div className="font-semibold" style={{ color: "var(--text-primary)", fontSize: "var(--text-body)" }}>{airport.city}</div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{airport.name}</div>
                  </div>
                  <div className="font-bold px-2 py-1 rounded-[var(--radius-radius-sm)] text-xs"
                    style={{ background: "rgba(59,113,254,0.12)", color: "var(--color-ocean-600)" }}>
                    {airport.code}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Không tìm thấy sân bay</div>
          )}
        </div>
      )}
    </div>
  );
};
