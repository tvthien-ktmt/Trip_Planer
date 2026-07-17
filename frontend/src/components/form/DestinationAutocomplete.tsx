'use client';
import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useDestinationsQuery } from '../../hooks/queries';

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DestinationAutocomplete = ({ value, onChange, placeholder = "Bạn muốn đi đâu?" }: DestinationAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { data: destinations } = useDestinationsQuery();

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = destinations?.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="relative flex-1 w-full" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-transparent border-none outline-none font-semibold cursor-text"
        style={{ color: "var(--text-primary)" }}
      />

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-[var(--radius-radius-md)] shadow-[var(--shadow-shadow-lg)] max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)" }}>
          {filtered.map(dest => (
            <div
              key={dest.id}
              className="px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-main)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              onClick={() => {
                setSearchTerm(dest.name);
                onChange(dest.name);
                setIsOpen(false);
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,113,254,0.12)" }}>
                <MapPin className="w-4 h-4" style={{ color: "var(--color-ocean-600)" }} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{dest.name}</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{dest.location}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
