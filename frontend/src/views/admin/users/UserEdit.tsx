'use client';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter , useParams} from 'next/navigation';
import { toast } from 'sonner';

export default function UserEdit() {
  const navigate = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã cập nhật thông tin người dùng!');
    navigate.push('/admin/users');
  };

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
            <input type="text" defaultValue="Nguyễn Văn A" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" defaultValue="nva@gmail.com" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
            <input type="tel" defaultValue="0987654321" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò</label>
            <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
            <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày sinh</label>
            <input type="date" defaultValue="1990-01-01" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
            <Save className="w-5 h-5" /> Cập nhật người dùng
          </button>
        </div>
      </form>
    </div>
  );
}
