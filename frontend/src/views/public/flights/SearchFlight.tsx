'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSearchFlightStore } from '../../../stores';
import { AirportAutocomplete } from '../../../components/form/AirportAutocomplete';
import { DatePickerRange } from '../../../components/form/DatePickerRange';

export default function SearchFlight() {
  const navigate = useRouter();
  const searchStore = useSearchFlightStore();

  const handleSearch = () => {
    if (!searchStore.departure || !searchStore.destination) {
      toast.error('Vui lòng chọn điểm đi và điểm đến');
      return;
    }
    navigate.push('/flights/results');
  };

  return (
    <div className="bg-[var(--bg-main)] min-h-[70vh] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)] font-display">Tìm kiếm chuyến bay</h1>
        
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-xl border border-[var(--border-main)]">
          <div className="flex flex-wrap gap-6 mb-6 pb-4 border-b border-[var(--border-main)]">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tripType" 
                  checked={searchStore.tripType === 'round-trip'} 
                  onChange={() => searchStore.setSearch({ tripType: 'round-trip' })}
                  className="w-4 h-4 text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)]"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">Khứ hồi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tripType" 
                  checked={searchStore.tripType === 'one-way'} 
                  onChange={() => searchStore.setSearch({ tripType: 'one-way' })}
                  className="w-4 h-4 text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)]"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">Một chiều</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tripType" 
                  className="w-4 h-4 text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)]"
                  disabled
                />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Nhiều chặng</span>
              </label>
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-[var(--border-main)]"></div>

            <div className="flex gap-4 flex-1">
              <select className="bg-transparent text-sm font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer">
                <option value="1">1 Hành khách</option>
                <option value="2">2 Hành khách</option>
                <option value="3">3 Hành khách</option>
                <option value="4">4 Hành khách</option>
              </select>
              <select className="bg-transparent text-sm font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer">
                <option value="eco">Phổ thông (Economy)</option>
                <option value="premium">Phổ thông cao cấp (Premium Eco)</option>
                <option value="business">Thương gia (Business)</option>
                <option value="first">Hạng Nhất (First)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative">
            <AirportAutocomplete 
              label="Từ"
              placeholder="Sân bay đi"
              value={searchStore.departure}
              onChange={(code) => searchStore.setSearch({ departure: code })}
            />
            
            <button className="absolute left-1/2 md:left-1/2 lg:left-1/4 top-1/2 -translate-x-1/2 lg:-translate-x-0 lg:-ml-4 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[var(--border-main)] rounded-full flex items-center justify-center text-[var(--color-ocean-600)] shadow-sm hover:bg-blue-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
            </button>

            <AirportAutocomplete 
              label="Đến"
              placeholder="Sân bay đến"
              value={searchStore.destination}
              onChange={(code) => searchStore.setSearch({ destination: code })}
            />
            
            <div className="lg:col-span-2">
              <DatePickerRange 
                label="Ngày bay"
                departureDate={searchStore.departureDate}
                returnDate={searchStore.returnDate}
                onChangeDeparture={(date) => searchStore.setSearch({ departureDate: date })}
                onChangeReturn={(date) => searchStore.setSearch({ returnDate: date })}
                tripType={searchStore.tripType}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-[var(--color-ocean-600)] rounded border-[var(--border-main)] focus:ring-[var(--color-ocean-600)]" />
              <span className="text-sm text-[var(--text-primary)]">Ngày bay linh hoạt (+/- 3 ngày)</span>
            </label>
            <button 
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-3 bg-[var(--color-ocean-600)] hover:bg-[var(--color-ocean-700)] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30"
            >
              Tìm chuyến bay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
