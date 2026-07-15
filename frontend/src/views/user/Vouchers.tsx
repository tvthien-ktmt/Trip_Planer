'use client';
import { Ticket, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Vouchers() {
  const [activeTab, setActiveTab] = useState('active');

  const vouchers = [
    { id: 1, title: 'Giảm 200k', desc: 'Áp dụng cho vé khứ hồi nội địa', code: 'VN200K', exp: '30/10/2026', status: 'active' },
    { id: 2, title: 'Giảm 10%', desc: 'Tối đa 500k cho chặng quốc tế', code: 'INT10', exp: '15/11/2026', status: 'active' },
    { id: 3, title: 'Miễn phí hành lý 20kg', desc: 'Áp dụng mọi chuyến bay', code: 'FREEBAG', exp: '01/01/2026', status: 'expired' },
  ];

  const filtered = vouchers.filter(v => v.status === activeTab);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voucher & Ưu đãi</h1>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('active')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Có thể sử dụng</button>
        <button onClick={() => setActiveTab('expired')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'expired' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Đã hết hạn/Sử dụng</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex overflow-hidden shadow-sm">
            <div className={`w-24 flex items-center justify-center text-white ${v.status === 'active' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gray-400'}`}>
              <Ticket className="w-8 h-8" />
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{v.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{v.desc}</p>
              <div className="flex justify-between items-center">
                <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-sm font-bold text-gray-700 dark:text-gray-300">{v.code}</span>
                <span className="text-xs text-red-500 flex items-center gap-1"><Clock className="w-3 h-3" /> HSD: {v.exp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
