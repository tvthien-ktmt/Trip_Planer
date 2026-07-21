'use client';
import { useState, useEffect } from 'react';
import { Search, Edit2, Lock, Unlock, Shield, Trash2, RefreshCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState('');

  // R5-FE-005 fix: Fetch real users from BE instead of hardcoded array
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users');
      const data = res.data?.data || res.data || [];
      setUsers(data.map((u: any) => ({
        id: String(u.id),
        name: u.fullName || u.name || '',
        email: u.email || '',
        role: u.role || 'USER',
        status: u.status || 'ACTIVE',
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '',
        isDeleted: !!u.deletedAt,
      })));
    } catch (e) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleLock = async (id: string, currentStatus: string) => {
    try {
      await api.patch(`/admin/users/${id}/lock`);
      toast.success(`Đã ${currentStatus === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản thành công`);
      fetchUsers();
    } catch (e) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Đã xóa mềm tài khoản');
      fetchUsers();
    } catch (e) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/restore`);
      toast.success('Đã khôi phục tài khoản');
      fetchUsers();
    } catch (e) {
      toast.error('Thao tác thất bại');
    }
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
