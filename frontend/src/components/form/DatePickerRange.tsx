import { Calendar } from 'lucide-react';

interface DatePickerRangeProps {
  label: string;
  departureDate: string | null;
  returnDate: string | null;
  onChangeDeparture: (date: string) => void;
  onChangeReturn: (date: string | null) => void;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
}

export const DatePickerRange = ({ 
  label, 
  departureDate, 
  returnDate, 
  onChangeDeparture, 
  onChangeReturn,
  tripType 
}: DatePickerRangeProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--text-secondary)" }} />
          <input
            type="date"
            className="w-full min-w-0 pl-10 pr-4 py-[11px] rounded-[var(--radius-radius-sm)] focus:outline-none transition-custom"
            style={{ 
              background: "var(--bg-main)", 
              border: "1px solid var(--border-main)",
              color: "var(--text-primary)",
              fontSize: "var(--text-body)"
            }}
            value={departureDate || ''}
            onChange={(e) => onChangeDeparture(e.target.value)}
          />
        </div>
        
        {tripType === 'round-trip' && (
          <div className="relative flex-1 min-w-0">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--text-secondary)" }} />
            <input
              type="date"
              className="w-full min-w-0 pl-10 pr-4 py-[11px] rounded-[var(--radius-radius-sm)] focus:outline-none transition-custom"
              style={{ 
                background: "var(--bg-main)", 
                border: "1px solid var(--border-main)",
                color: "var(--text-primary)",
                fontSize: "var(--text-body)"
              }}
              value={returnDate || ''}
              min={departureDate || undefined}
              onChange={(e) => onChangeReturn(e.target.value)}
              placeholder="Khứ hồi"
            />
          </div>
        )}
      </div>
    </div>
  );
};
