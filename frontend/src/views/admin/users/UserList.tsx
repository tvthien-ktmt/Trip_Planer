'use client';
import { useState } from 'react';
import { Search, Edit2, Lock, Unlock, Shield, Trash2, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState('');

  const [users, setUsers] = useState([
    { id: '1', name: 'Nguyễn Văn A', email: 'nva@gmail.com', role: 'User', status: 'Active', joinDate: '20/10/2023', isDeleted: false },
    { id: '2', name: 'Trần Thị B', email: 'ttb@gmail.com', role: 'User', status: 'Locked', joinDate: '15/11/2023', isDeleted: false },
    { id: '3', name: 'Lê Hoàng C', email: 'lhc@gmail.com', role: 'Staff', status: 'Active', joinDate: '01/12/2023', isDeleted: false },
    { id: '4', name: 'Phạm D', email: 'pd@gmail.com', role: 'User', status: 'Active', joinDate: '10/12/2023', isDeleted: true }, // Soft deleted
    { id: '999', name: 'Admin T', email: 'admin@tripplanner.com', role: 'Admin', status: 'Active', joinDate: '01/01/2023', isDeleted: false },
  ]);

  const handleToggleLock = (id: string, currentStatus: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn ${currentStatus === 'Active' ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
      setUsers(users.map(u => u.id === id ? { ...u, status: currentStatus === 'Active' ? 'Locked' : 'Active' } : u));
      toast.success(`Đã ${currentStatus === 'Active' ? 'khóa' : 'mở khóa'} tài khoản thành công`);
    }
  };

  const handleSoftDelete = (id: string) => {
    if (window.confirm('Chuyển tài khoản này vào thùng rác (Soft Delete)?')) {
      setUsers(users.map(u => u.id === id ? { ...u, isDeleted: true } : u));
      toast.success('Đã xóa mềm tài khoản');
    }
  };

  const handleRestore = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isDeleted: false } : u));
    toast.success('Đã khôi phục tài khoản');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)]">
            Quản lý Người dùng
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Tìm kiếm, phân quyền và khóa tài khoản</p>
        </div>
        <Button variant="primary">Thêm người dùng mới</Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Tìm kiếm Tên, Email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]">
          <option value="all">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="User">User</option>
        </select>
        <select className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]">
          <option value="active">Đang hoạt động</option>
          <option value="locked">Bị khóa</option>
          <option value="deleted">Đã xóa (Thùng rác)</option>
        </select>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                <th className="p-4 font-medium">Họ và Tên</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Vai trò</th>
                <th className="p-4 font-medium">Ngày tham gia</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-[var(--bg-main)] transition-colors ${u.isDeleted ? 'opacity-50 bg-gray-50 dark:bg-gray-900' : ''}`}>
                  <td className="p-4 font-medium text-[var(--text-primary)]">
                    {u.name} {u.isDeleted && <span className="text-xs text-red-500 ml-2">(Đã xóa)</span>}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      u.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                      u.role === 'Staff' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {u.role === 'Admin' && <Shield className="w-3 h-3" />} {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] text-sm">{u.joinDate}</td>
                  <td className="p-4">
                    {!u.isDeleted && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {u.isDeleted ? (
                      <button onClick={() => handleRestore(u.id)} className="p-2 text-[var(--text-secondary)] hover:text-green-600 bg-gray-100 dark:bg-gray-800 hover:bg-green-50 rounded-lg transition-colors" title="Khôi phục">
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-ocean-600)] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Phân quyền / Chỉnh sửa">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.id !== '999' && (
                          <button onClick={() => handleToggleLock(u.id, u.status)} className={`p-2 rounded-lg transition-colors ${u.status === 'Active' ? 'text-[var(--text-secondary)] hover:text-yellow-600 hover:bg-yellow-50' : 'text-yellow-500 hover:text-green-600 hover:bg-green-50'}`} title={u.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}>
                            {u.status === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        )}
                        {u.id !== '999' && (
                          <button onClick={() => handleSoftDelete(u.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Xóa mềm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
