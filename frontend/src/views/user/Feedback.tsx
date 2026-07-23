'use client';
import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';

export default function Feedback() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    rating: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.rating || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/contact', {
        fullName: user?.fullName || 'Người dùng ẩn danh',
        email: user?.email || 'no-reply@tripplanner.vn',
        subject: `[Phản hồi - ${formData.subject}] Đánh giá: ${formData.rating} sao`,
        message: formData.message,
      });

      toast.success('Gửi phản hồi thành công. Cảm ơn bạn đã đóng góp ý kiến!');
      setFormData({ subject: '', rating: '', message: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi phản hồi, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-main)] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Đóng góp ý kiến</h1>
          <p className="text-[var(--text-secondary)] mt-1">Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Chủ đề phản hồi *</label>
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-colors appearance-none"
            >
              <option value="">Chọn chủ đề...</option>
              <option value="app_bug">Báo lỗi ứng dụng / trang web</option>
              <option value="service_quality">Chất lượng dịch vụ tour / vé máy bay</option>
              <option value="payment">Vấn đề thanh toán</option>
              <option value="suggestion">Đóng góp ý tưởng cải tiến</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Đánh giá trải nghiệm *</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} className="cursor-pointer relative">
                  <input 
                    type="radio" 
                    name="rating" 
                    value={num}
                    checked={formData.rating === String(num)}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border-main)] text-[var(--text-secondary)] peer-checked:bg-[var(--color-ocean-600)] peer-checked:text-white peer-checked:border-[var(--color-ocean-600)] transition-colors hover:bg-[var(--bg-main)]">
                    {num}
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">1: Rất tệ — 5: Tuyệt vời</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Mô tả chi tiết *</label>
            <textarea 
              rows={5} 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-colors resize-none"
              placeholder="Vui lòng chia sẻ chi tiết phản hồi của bạn tại đây..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Đính kèm ảnh/video (không bắt buộc)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--border-main)] border-dashed rounded-xl hover:border-[var(--color-ocean-600)] transition-colors bg-[var(--bg-main)]">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-[var(--text-secondary)]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-[var(--text-primary)]">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[var(--color-ocean-600)] hover:text-[var(--color-ocean-700)] focus-within:outline-none focus-within:underline">
                    <span>Tải file lên</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">hoặc kéo thả vào đây</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">PNG, JPG, MP4 tối đa 10MB</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
