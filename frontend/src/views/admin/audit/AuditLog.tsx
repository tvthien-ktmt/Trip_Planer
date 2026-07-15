'use client';
import { useState } from 'react';
import { Search, Filter, ShieldAlert, Edit, Trash, LogIn } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    { id: '1', user: 'admin_super', action: 'Xóa chuyến bay', target: 'FL-8892', ip: '113.161.45.22', time: '10 phút trước', type: 'danger' },
    { id: '2', user: 'admin_content', action: 'Cập nhật bài viết', target: 'Khám phá Kyoto', ip: '14.232.11.5', time: '1 giờ trước', type: 'warning' },
    { id: '3', user: 'admin_support', action: 'Hoàn tiền vé', target: 'BKG-A7291', ip: '103.22.44.1', time: '3 giờ trước', type: 'warning' },
    { id: '4', user: 'admin_super', action: 'Đăng nhập hệ thống', target: '-', ip: '113.161.45.22', time: 'Hôm qua, 08:30', type: 'info' },
    { id: '5', user: 'admin_sales', action: 'Tạo mã giảm giá', target: 'SUMMER2024', ip: '45.122.33.1', time: 'Hôm qua, 15:20', type: 'info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Nhật ký hoạt động (Audit Log)
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Giám sát và truy vết các thao tác của quản trị viên hệ thống</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          Xuất dữ liệu Log
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Tìm theo user, hành động, IP..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]">
          <option value="all">Tất cả hành động</option>
          <option value="delete">Xóa</option>
          <option value="update">Cập nhật</option>
          <option value="login">Đăng nhập</option>
        </select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Lọc theo thời gian
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                <th className="p-4 font-medium">Người dùng (Admin)</th>
                <th className="p-4 font-medium">Hành động</th>
                <th className="p-4 font-medium">Đối tượng tác động</th>
                <th className="p-4 font-medium">Địa chỉ IP</th>
                <th className="p-4 font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-main)] transition-colors">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{log.user}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {log.type === 'danger' && <Trash className="w-4 h-4 text-red-500" />}
                      {log.type === 'warning' && <Edit className="w-4 h-4 text-yellow-500" />}
                      {log.type === 'info' && <LogIn className="w-4 h-4 text-blue-500" />}
                      <span className="text-[var(--text-primary)]">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{log.target}</td>
                  <td className="p-4 text-sm font-mono text-[var(--text-secondary)]">{log.ip}</td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
