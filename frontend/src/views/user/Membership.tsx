'use client';
import { Crown, Star, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function Membership() {
  const [membership, setMembership] = useState<any>(null);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMembership = async () => {
      setIsLoading(true);
      try {
        const [memberRes, pointsRes] = await Promise.all([
          api.get('/users/me/membership'),
          api.get('/users/me/points'),
        ]);
        setMembership(memberRes.data?.data || memberRes.data);
        const points = pointsRes.data?.data || pointsRes.data || [];
        setPointHistory(Array.isArray(points) ? points : points.transactions || []);
      } catch (e) {
        setMembership(null);
        setPointHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMembership();
  }, []);

  const tierColors: Record<string, string> = {
    BRONZE: 'from-orange-300 to-orange-500',
    SILVER: 'from-gray-300 to-gray-400',
    GOLD: 'from-yellow-400 to-yellow-600',
    PLATINUM: 'from-blue-300 to-blue-600',
    DIAMOND: 'from-purple-400 to-purple-700',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const tier = membership?.tier?.name || 'SILVER';
  const cardColor = tierColors[tier] || tierColors['SILVER'];
  const currentPoints = membership?.pointsBalance || membership?.currentPoints || 0;
  const nextTierPoints = membership?.tier?.minPoints || 3000;
  const progress = Math.min(100, Math.round((currentPoints / nextTierPoints) * 100));

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thẻ thành viên & Dặm thưởng</h1>

      <div className={`bg-gradient-to-br ${cardColor} p-8 rounded-2xl text-white shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 uppercase tracking-widest text-sm font-medium mb-1">{tier} Member</p>
            <p className="text-3xl font-black tracking-widest mb-6">{membership?.cardNumber || '----'}</p>
            <p className="text-lg font-bold">{membership?.user?.fullName || 'Thành viên'}</p>
          </div>
          <Crown className="w-16 h-16 text-white/50" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tiến trình điểm thưởng</h2>
            <p className="text-gray-500 mt-1">Tích lũy điểm để lên hạng</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{currentPoints.toLocaleString('vi-VN')} <span className="text-sm font-medium text-gray-500">/ {nextTierPoints.toLocaleString('vi-VN')} điểm</span></p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Lịch sử điểm thưởng</h2>
        <div className="space-y-4">
          {pointHistory.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{item.description || item.reason || 'Giao dịch điểm'}</p>
                  <p className="text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold text-lg ${item.points > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
          {pointHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">Chưa có lịch sử điểm thưởng.</div>
          )}
        </div>
      </div>
    </div>
  );
}
