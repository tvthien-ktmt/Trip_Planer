'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Plane, Building, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';
import { toast } from 'sonner';

interface Airport {
  id: string;
  iataCode: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export default function AirportList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAirports = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/airports', { params: { search: q || undefined } });
      setAirports(res.data?.data || res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách sân bay');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAirports(); }, []);

  const handleSearch = () => fetchAirports(searchTerm);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Quản lý Sân bay
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Cấu hình thông tin sân bay trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAirports(searchTerm)}
            className="p-2 rounded-xl border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm sân bay mới
          </Button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên hoặc thành phố..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-[var(--color-ocean-600)] text-white rounded-[var(--radius-radius-sm)] hover:opacity-90 transition-opacity"
        >
          Tìm
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)
          : airports.map((airport) => (
              <div key={airport.id} className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm hover:border-[var(--color-ocean-600)] transition-colors overflow-hidden flex flex-col">
                <div className="p-5 border-b border-[var(--border-main)] flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[var(--color-ocean-600)] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {airport.iataCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] line-clamp-1" title={airport.name}>{airport.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {airport.city}, {airport.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> Múi giờ
                    </h4>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] text-xs rounded-md border border-[var(--border-main)]">
                      {airport.timezone}
                    </span>
                  </div>
                </div>

                <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-main)] flex justify-end items-center gap-2">
                  <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-ocean-600)] transition-colors rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 transition-colors rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        {!loading && airports.length === 0 && !error && (
          <div className="col-span-3 p-8 text-center text-[var(--text-secondary)]">
            Không tìm thấy sân bay nào
          </div>
        )}
      </div>
    </div>
  );
}
