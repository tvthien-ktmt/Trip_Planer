import { Crown, Star, ChevronRight } from 'lucide-react';

export default function Membership() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thẻ thành viên & Dặm thưởng</h1>

      <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-gray-100 uppercase tracking-widest text-sm font-medium mb-1">Silver Member</p>
            <p className="text-3xl font-black tracking-widest mb-6">9080 1234 5678</p>
            <p className="text-lg font-bold">NGUYEN VAN A</p>
          </div>
          <Crown className="w-16 h-16 text-white/50" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tiến trình lên hạng Vàng (Gold)</h2>
            <p className="text-gray-500 mt-1">Cần thêm 1,750 dặm để lên hạng</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">1,250 <span className="text-sm font-medium text-gray-500">/ 3,000 dặm</span></p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full" style={{ width: '41%' }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Lịch sử dặm thưởng</h2>
        <div className="space-y-4">
          {[
            { id: 1, title: 'Chuyến bay VN210 (SGN - HAN)', date: '20/10/2026', miles: '+500' },
            { id: 2, title: 'Đổi Voucher giảm 200k', date: '15/09/2026', miles: '-200' },
            { id: 3, title: 'Chuyến bay VJ9C4D (HAN - DAD)', date: '10/08/2026', miles: '+300' },
          ].map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${item.miles.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold text-lg ${item.miles.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>{item.miles}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
