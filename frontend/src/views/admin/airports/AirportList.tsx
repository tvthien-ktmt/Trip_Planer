'use client';
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Plane, Building } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function AirportList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const airports = [
    { id: '1', code: 'SGN', name: 'Sân bay quốc tế Tân Sơn Nhất', city: 'Hồ Chí Minh', country: 'Việt Nam', terminals: ['T1 (Quốc nội)', 'T2 (Quốc tế)'], runways: ['25L/07R', '25R/07L'], status: 'Active' },
    { id: '2', code: 'HAN', name: 'Sân bay quốc tế Nội Bài', city: 'Hà Nội', country: 'Việt Nam', terminals: ['T1', 'T2'], runways: ['11L/29R', '11R/29L'], status: 'Active' },
    { id: '3', code: 'DAD', name: 'Sân bay quốc tế Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam', terminals: ['T1', 'T2'], runways: ['35R/17L'], status: 'Active' },
    { id: '4', code: 'NRT', name: 'Sân bay quốc tế Narita', city: 'Tokyo', country: 'Nhật Bản', terminals: ['T1', 'T2', 'T3'], runways: ['16R/34L', '16L/34R'], status: 'Active' },
    { id: '5', code: 'SIN', name: 'Sân bay quốc tế Changi', city: 'Singapore', country: 'Singapore', terminals: ['T1', 'T2', 'T3', 'T4', 'Jewel'], runways: ['02L/20R', '02C/20C', '02R/20L'], status: 'Maintenance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Quản lý Sân bay
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Cấu hình nhà ga (Terminal) và đường băng (Runway)</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm sân bay mới
        </Button>
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
          />
        </div>
        <select className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]">
          <option value="all">Tất cả quốc gia</option>
          <option value="vn">Việt Nam</option>
          <option value="jp">Nhật Bản</option>
          <option value="sg">Singapore</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {airports.map((airport) => (
          <div key={airport.id} className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm hover:border-[var(--color-ocean-600)] transition-colors overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[var(--border-main)] flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[var(--color-ocean-600)] flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {airport.code}
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
                  <Building className="w-3.5 h-3.5" /> Nhà ga (Terminals)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {airport.terminals.map(t => (
                    <span key={t} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] text-xs rounded-md border border-[var(--border-main)]">
                      {t}
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-[var(--bg-main)] text-[var(--color-ocean-600)] text-xs rounded-md border border-dashed border-[var(--color-ocean-600)] hover:bg-blue-50">
                    + Thêm
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5" /> Đường băng (Runways)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {airport.runways.map(r => (
                    <span key={r} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] text-xs rounded-md border border-[var(--border-main)]">
                      {r}
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-[var(--bg-main)] text-[var(--color-ocean-600)] text-xs rounded-md border border-dashed border-[var(--color-ocean-600)] hover:bg-blue-50">
                    + Thêm
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-main)] flex justify-between items-center">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                airport.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {airport.status === 'Active' ? 'Hoạt động' : 'Bảo trì'}
              </span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-ocean-600)] transition-colors rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 transition-colors rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
