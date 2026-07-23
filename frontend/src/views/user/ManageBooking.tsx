'use client';
import { useState } from 'react';
import { Ticket, Calendar, AlertCircle, Briefcase, Utensils, Settings as SettingsIcon, MapPin, ChevronRight, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ModalConfirm } from '../../components/ui/ModalConfirm';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ManageBooking() {
  const [pnrInput, setPnrInput] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;
    
    setIsLoading(true);
    try {
      // Find booking by PNR/ID
      // Usually PNR can be searched via a specific endpoint, or we can fetch my bookings and filter
      const res = await api.get('/bookings/my');
      const allBookings = res.data?.data || res.data || [];
      const found = allBookings.find((b: any) => b.bookingCode === pnrInput.trim() || b.id.toString() === pnrInput.trim());
      
      if (found) {
        // Fetch detailed booking
        const detailRes = await api.get(`/bookings/${found.id}`);
        setBooking(detailRes.data);
      } else {
        toast.error('Không tìm thấy chuyến bay với mã này');
        setBooking(null);
      }
    } catch (err) {
      toast.error('Lỗi khi tìm kiếm chuyến bay');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: 'CANCELLED' });
      toast.success('Yêu cầu hủy chuyến thành công');
      setIsCancelModalOpen(false);
      setBooking({ ...booking, status: 'CANCELLED' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy chuyến bay');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Quản lý đặt chỗ</h1>
          <p className="text-[var(--text-secondary)] mt-1">Tra cứu, thay đổi lịch trình hoặc mua thêm dịch vụ</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4 max-w-md">
          <input 
            type="text" 
            placeholder="Nhập mã đặt chỗ (PNR)..." 
            value={pnrInput}
            onChange={e => setPnrInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:border-[var(--color-ocean-600)]"
          />
          <Button variant="primary" type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Tra cứu
          </Button>
        </form>
      </div>

      {booking && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
            <div className="bg-[var(--bg-main)] p-4 border-b border-[var(--border-main)] flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Mã đặt chỗ (PNR)</p>
                <p className="text-xl font-bold text-[var(--color-ocean-600)]">{booking.bookingCode}</p>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <CheckCircle2 className="w-4 h-4" /> {booking.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase">Thông tin đặt chỗ</h3>
                <p className="font-semibold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--color-ocean-600)]" /> {booking.type === 'FLIGHT' ? 'Chuyến bay' : 'Tour'}
                </p>
                <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Đặt ngày: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                  Tổng tiền: <span className="font-bold text-[var(--color-ocean-600)]">{Number(booking.totalAmount).toLocaleString()} VNĐ</span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase">Hành khách</h3>
                <ul className="space-y-1">
                  {booking.passengers?.map((p: any, i: number) => (
                    <li key={i} className="font-medium text-[var(--text-primary)]">{i + 1}. {p.fullName}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-8 mb-4">Các chức năng quản lý</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={() => router.push(`/user/bookings/${booking.id}`)} className="border border-[var(--border-main)] p-4 rounded-xl flex items-center gap-4 hover:border-[var(--color-ocean-600)] transition-colors cursor-pointer group bg-[var(--bg-surface)]">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-ocean-600)] transition-colors">Xem chi tiết vé</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Xem chi tiết thông tin vé máy bay hoặc tour của bạn.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-ocean-600)]" />
            </div>

            <div className="border border-[var(--border-main)] p-4 rounded-xl flex items-center gap-4 hover:border-[var(--color-ocean-600)] transition-colors cursor-pointer group bg-[var(--bg-surface)] opacity-50">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] transition-colors">Đổi ghế ngồi</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Chức năng đang được nâng cấp.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
          </div>

          {booking.status !== 'CANCELLED' && (
            <div className="mt-8 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Hủy đặt chỗ
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300/80 mt-1">Hủy chuyến bay có thể phát sinh phí tùy theo hạng vé.</p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 flex-shrink-0 whitespace-nowrap" onClick={() => setIsCancelModalOpen(true)}>
                Yêu cầu hủy vé
              </Button>
            </div>
          )}

          <ModalConfirm 
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelBooking}
            title="Xác nhận hủy vé?"
            message="Yêu cầu hủy vé của bạn sẽ được gửi đến bộ phận xử lý. Bạn có chắc chắn muốn hủy chuyến bay này?"
            confirmText="Xác nhận Hủy"
          />
        </div>
      )}
    </div>
  );
}
