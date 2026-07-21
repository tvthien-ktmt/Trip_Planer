'use client';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter , useParams} from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function UserEdit() {
  const navigate = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { api } = await import('../../../lib/api');
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data?.data || res.data);
      } catch (err) {
        toast.error('Không thể tải thông tin người dùng');
        navigate.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id, navigate]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      status: formData.get('status'),
      dateOfBirth: formData.get('dateOfBirth') ? new Date(formData.get('dateOfBirth') as string).toISOString() : null,
    };

    try {
      const { api } = await import('../../../lib/api');
      await api.patch(`/admin/users/${id}`, data);
      toast.success('Đã cập nhật thông tin người dùng!');
      navigate.push('/admin/users');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-600 animate-pulse">Đang tải...</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate.back()} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cập nhật tài khoản: #{id}</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
            <input type="text" name="fullName" defaultValue={user.fullName} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" name="email" defaultValue={user.email} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
            <input type="tel" name="phone" defaultValue={user.phone || ''} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò</label>
            <select name="role" defaultValue={user.role || 'USER'} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
            <select name="status" defaultValue={user.status || 'ACTIVE'} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="ACTIVE">Active</option>
              <option value="LOCKED">Locked</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày sinh</label>
            <input type="date" name="dateOfBirth" defaultValue={user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" /> {isSubmitting ? 'Đang lưu...' : 'Cập nhật người dùng'}
          </button>
        </div>
      </form>
    </div>
  );
}
