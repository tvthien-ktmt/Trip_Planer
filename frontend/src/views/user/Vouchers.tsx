'use client';
import { Ticket, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function Vouchers() {
  const [activeTab, setActiveTab] = useState('active');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVouchers = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/vouchers/my');
        const data = res.data?.data || res.data || [];
        setVouchers(data.map((v: any) => ({
          id: String(v.id),
          title: v.description || v.name || 'Voucher',
          desc: v.description || '',
          code: v.code || '',
          exp: v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'N/A',
          status: v.expiresAt && new Date(v.expiresAt) > new Date() ? 'active' : 'expired',
          discount: v.discountPercent ? `${v.discountPercent}%` : v.discountAmount ? `${Number(v.discountAmount).toLocaleString('vi-VN')}₫` : '',
        })));
      } catch (e) {
        setVouchers([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadVouchers();
  }, []);

  const filtered = vouchers.filter(v => v.status === activeTab);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voucher & Ưu đãi</h1>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('active')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Có thể sử dụng</button>
        <button onClick={() => setActiveTab('expired')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'expired' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Đã hết hạn/Sử dụng</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
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
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">
              Không có voucher nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
