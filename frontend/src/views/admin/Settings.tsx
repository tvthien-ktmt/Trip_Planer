'use client';
import { useState } from 'react';
import { Save, Shield, Settings as SettingsIcon, Mail, CreditCard, Database } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã lưu cấu hình hệ thống');
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: SettingsIcon },
    { id: 'email', label: 'Email & SMTP', icon: Mail },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'system', label: 'Hệ thống (Backup)', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)]">
          Cấu hình Hệ thống
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Quản lý toàn bộ cấu hình lõi của hệ thống Trip Planner</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-ocean-600)] text-white' 
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] border border-[var(--border-main)]'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSave} className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm space-y-8">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3">Thông tin Công ty</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Tên Website / Tên công ty</label>
                    <input type="text" defaultValue="Trip Planner VN" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Đa ngôn ngữ (Mặc định)</label>
                    <select className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none">
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Mô tả SEO trang chủ (Meta Description)</label>
                    <textarea rows={3} defaultValue="Nền tảng đặt vé máy bay và tour du lịch hàng đầu Việt Nam" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] focus:border-[var(--color-ocean-600)] outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Logo hệ thống</label>
                    <div className="border-2 border-dashed border-[var(--border-main)] p-4 rounded-xl text-center">
                      <Button type="button" variant="outline" size="sm">Tải ảnh Logo lên</Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Favicon</label>
                    <div className="border-2 border-dashed border-[var(--border-main)] p-4 rounded-xl text-center">
                      <Button type="button" variant="outline" size="sm">Tải Favicon lên</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email & SMTP Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3">Cấu hình Email / SMTP</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">SMTP Host</label>
                    <input type="text" defaultValue="smtp.gmail.com" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">SMTP Port</label>
                    <input type="number" defaultValue="587" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email gửi đi (Sender)</label>
                    <input type="email" defaultValue="noreply@tripplanner.vn" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Mật khẩu ứng dụng (App Password)</label>
                    <input type="password" defaultValue="********" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] outline-none" />
                  </div>
                </div>
                <Button type="button" variant="outline">Gửi Email Test</Button>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3">Cổng thanh toán</h2>
                
                <div className="p-4 border border-[var(--border-main)] rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--color-ocean-600)]">VNPay Configuration</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-ocean-600)]"></div>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">VNP_TMN_CODE</label>
                      <input type="text" defaultValue="TRIPVN01" className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">VNP_HASH_SECRET</label>
                      <input type="password" defaultValue="*****************" className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Môi trường (Sandbox/Production)</label>
                      <select className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]">
                        <option value="sandbox">Sandbox (Thử nghiệm)</option>
                        <option value="production">Production (Thực tế)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-[var(--border-main)] rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--color-ocean-600)]">SePay (Chuyển khoản tự động)</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-ocean-600)]"></div>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">API Token</label>
                      <input type="password" defaultValue="********" className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Số tài khoản thụ hưởng</label>
                      <input type="text" defaultValue="190366668888" className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-primary)]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3">Bảo mật hệ thống</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Chính sách Mật khẩu</label>
                    <select className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] outline-none">
                      <option value="medium">Trung bình (8 ký tự, có số)</option>
                      <option value="strong">Mạnh (8 ký tự, có số, chữ hoa, ký tự đặc biệt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Session Timeout (Phút)</label>
                    <input type="number" defaultValue="120" className="w-full p-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-primary)] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[var(--color-ocean-600)] focus:ring-[var(--color-ocean-600)]" defaultChecked />
                      <span className="text-sm font-medium text-[var(--text-primary)]">Bật xác thực 2 bước (2FA) cho toàn bộ Admin</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-main)] pb-3">Hệ thống & Sao lưu</h2>
                
                <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-red-700 dark:text-red-400">Chế độ bảo trì (Maintenance Mode)</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer dark:bg-red-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300/80">Khi bật chế độ này, toàn bộ trang Public sẽ hiển thị thông báo bảo trì. Chỉ Admin mới có thể đăng nhập.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="border border-[var(--border-main)] p-4 rounded-xl">
                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Sao lưu dữ liệu (Backup)</h4>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">Tạo bản sao lưu cấu hình, người dùng và dữ liệu đặt vé.</p>
                    <Button type="button" variant="primary" className="w-full">Tạo bản Backup ngay</Button>
                  </div>
                  <div className="border border-[var(--border-main)] p-4 rounded-xl">
                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Phục hồi (Restore)</h4>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">Khôi phục hệ thống từ một bản sao lưu trước đó.</p>
                    <Button type="button" variant="outline" className="w-full">Khôi phục dữ liệu</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-[var(--border-main)] flex justify-end">
              <Button type="submit" variant="primary" className="flex items-center gap-2 px-8">
                <Save className="w-4 h-4" /> Lưu cấu hình
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
