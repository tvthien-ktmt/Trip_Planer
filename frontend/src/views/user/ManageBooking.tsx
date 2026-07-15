'use client';
import { useState } from 'react';
import { Ticket, Calendar, AlertCircle, Briefcase, Utensils, Settings as SettingsIcon, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ModalConfirm } from '../../components/ui/ModalConfirm';

export default function ManageBooking() {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const booking = {
    pnr: 'BKG-A7291',
    status: 'Confirmed',
    passengers: ['Nguyễn Văn A', 'Trần Thị B'],
    route: 'Hồ Chí Minh (SGN) → Tokyo (NRT)',
    date: '15/11/2024 - 08:30 AM',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Quản lý đặt chỗ nâng cao</h1>
          <p className="text-[var(--text-secondary)] mt-1">Thay đổi lịch trình, mua thêm hành lý hoặc hủy vé</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="bg-[var(--bg-main)] p-4 border-b border-[var(--border-main)] flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Mã đặt chỗ (PNR)</p>
            <p className="text-xl font-bold text-[var(--color-ocean-600)]">{booking.pnr}</p>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Đã xác nhận
            </span>
          </div>
        </div>
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase">Hành trình</h3>
            <p className="font-semibold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-ocean-600)]" /> {booking.route}
            </p>
            <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Khởi hành: {booking.date}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase">Hành khách</h3>
            <ul className="space-y-1">
              {booking.passengers.map((p, i) => (
                <li key={i} className="font-medium text-[var(--text-primary)]">{i + 1}. {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-8 mb-4">Các chức năng quản lý</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[var(--border-main)] p-4 rounded-xl flex items-center gap-4 hover:border-[var(--color-ocean-600)] transition-colors cursor-pointer group bg-[var(--bg-surface)]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-ocean-600)] transition-colors">Đổi ngày bay / Chuyến bay</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Thay đổi ngày khởi hành (có thể phát sinh phí chênh lệch).</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-ocean-600)]" />
        </div>

        <div className="border border-[var(--border-main)] p-4 rounded-xl flex items-center gap-4 hover:border-[var(--color-ocean-600)] transition-colors cursor-pointer group bg-[var(--bg-surface)]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-ocean-600)] transition-colors">Đổi ghế ngồi</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Nâng cấp lên ghế hạng thương gia hoặc chọn ghế sát cửa sổ.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-ocean-600)]" />
        </div>

        <div className="border border-[var(--border-main)] p-4 rounded-xl flex items-center gap-4 hover:border-[var(--color-ocean-600)] transition-colors cursor-pointer group bg-[var(--bg-surface)]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-ocean-600)] transition-colors">Mua thêm hành lý</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Mua trước hành lý ký gửi để tiết kiệm lên đến 50% phí sân bay.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-ocean-600)]" />
        </div>

        <div className="border border-[var(--border-main)] p-4 rounded-xl flex items-center gap-4 hover:border-[var(--color-ocean-600)] transition-colors cursor-pointer group bg-[var(--bg-surface)]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-ocean-600)] transition-colors">Thêm suất ăn nóng</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Đặt trước các suất ăn đặc biệt hoặc menu đa dạng trên máy bay.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-ocean-600)]" />
        </div>
      </div>

      <div className="mt-8 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Hủy đặt chỗ
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300/80 mt-1">Bạn có thể được hoàn tiền một phần hoặc toàn bộ tùy theo hạng vé đã mua.</p>
        </div>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 flex-shrink-0 whitespace-nowrap" onClick={() => setIsCancelModalOpen(true)}>
          Yêu cầu hủy vé
        </Button>
      </div>

      <ModalConfirm 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => setIsCancelModalOpen(false)}
        title="Xác nhận hủy vé?"
        message="Yêu cầu hủy vé của bạn sẽ được gửi đến bộ phận xử lý. Lưu ý rằng phí hủy vé sẽ được áp dụng dựa trên hạng vé của bạn (Thường là 1.000.000 VNĐ cho hạng Eco)."
        confirmText="Xác nhận Hủy"
      />
    </div>
  );
}
