'use client';
import { useState } from 'react';
import { Camera, Save, User as UserIcon, MapPin, Phone, Mail, FileText, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores';

export default function Profile() {
  const { user } = useAuthStore();
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-[var(--border-main)] pb-4">
        <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Hồ sơ cá nhân</h1>
        <p className="text-[var(--text-secondary)] mt-1">Quản lý thông tin cá nhân và giấy tờ tùy thân của bạn</p>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[var(--bg-surface)] shadow-lg overflow-hidden">
            <img src={avatar} alt="Ảnh đại diện người dùng" className="w-full h-full object-cover" />
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-ocean-600)] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[var(--color-ocean-700)] transition-colors border-2 border-white dark:border-[var(--bg-surface)]">
            <Camera className="w-4 h-4" />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.name || 'Người dùng mới'}</h2>
          <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4" /> {user?.email || 'Chưa cập nhật email'}
          </p>
          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">Thành viên Hạng Bạc</span>
          </div>
        </div>
      </div>

      <form className="space-y-6 bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm">
        <h3 className="font-semibold text-lg text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3 mb-6">Thông tin cơ bản</h3>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><UserIcon className="w-4 h-4 text-[var(--text-secondary)]" /> Họ và tên (Như trên giấy tờ)</label>
            <input type="text" defaultValue={user?.name} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--text-secondary)]" /> Số điện thoại</label>
            <input type="tel" defaultValue="0987654321" className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-[var(--text-secondary)]" /> Quốc tịch (Nationality)</label>
            <select className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none transition-colors">
              <option value="vn">Việt Nam (Vietnam)</option>
              <option value="us">Hoa Kỳ (USA)</option>
              <option value="jp">Nhật Bản (Japan)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--text-secondary)]" /> Ngày sinh</label>
            <input type="date" defaultValue="1990-01-01" className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none transition-colors" />
          </div>
        </div>

        <h3 className="font-semibold text-lg text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3 mt-10 mb-6">Giấy tờ tùy thân (Dùng để đặt vé)</h3>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-4 border border-[var(--border-main)] rounded-xl bg-[var(--bg-main)]">
            <h4 className="font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-[var(--color-ocean-600)]" /> CCCD / CMND (Nội địa)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Số CCCD</label>
                <input type="text" defaultValue="07909000xxxx" className="w-full p-2.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Ngày cấp</label>
                <input type="date" className="w-full p-2.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-[var(--text-primary)]" />
              </div>
            </div>
          </div>

          <div className="p-4 border border-[var(--border-main)] rounded-xl bg-[var(--bg-main)]">
            <h4 className="font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-[var(--color-ocean-600)]" /> Hộ chiếu (Quốc tế)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Số Hộ chiếu (Passport No.)</label>
                <input type="text" defaultValue="C8872xxx" className="w-full p-2.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Ngày hết hạn (Expiry Date)</label>
                <input type="date" defaultValue="2030-10-15" className="w-full p-2.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg text-[var(--text-primary)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-8 border-t border-[var(--border-main)] flex justify-end gap-4">
          <Button type="button" variant="outline">Hủy bỏ</Button>
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu cập nhật
          </Button>
        </div>
      </form>
    </div>
  );
}
