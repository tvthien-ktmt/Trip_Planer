import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function BlogList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useRouter();

  // R5-FE-005 fix: Fetch real blogs from BE
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/blogs');
      const data = res.data?.data || res.data || [];
      setBlogs(data.map((b: any) => ({
        id: String(b.id),
        title: b.title || 'N/A',
        category: b.categoryId ? `Category ${b.categoryId}` : 'N/A',
        author: b.author?.fullName || 'N/A',
        views: b.viewCount || 0,
        status: b.status || 'DRAFT',
        date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('vi-VN') : (b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '')
      })));
    } catch (e) {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = (id: string) => {
    toast.warning('Bạn có chắc chắn muốn xóa bài viết này?', {
      action: {
        label: 'Đồng ý',
        onClick: async () => {
          try {
            await api.delete(`/admin/blogs/${id}`);
            toast.success('Đã xóa bài viết thành công');
            fetchBlogs();
          } catch (e) {
            toast.error('Xóa bài viết thất bại');
          }
        }
      },
      cancel: { label: 'Hủy', onClick: () => {} }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Quản lý Bài viết (Blog)
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Quản lý nội dung tin tức, kinh nghiệm du lịch</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Viết bài mới
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]">
          <option value="all">Tất cả chuyên mục</option>
          <option value="destination">Điểm đến</option>
          <option value="tips">Kinh nghiệm</option>
          <option value="cuisine">Ẩm thực</option>
        </select>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                <th className="p-4 font-medium">Tiêu đề bài viết</th>
                <th className="p-4 font-medium">Chuyên mục</th>
                <th className="p-4 font-medium">Tác giả</th>
                <th className="p-4 font-medium">Lượt xem</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-[var(--bg-main)] transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-[var(--text-primary)] line-clamp-1">{blog.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{blog.date}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] rounded-md text-xs font-medium">
                      {blog.category}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-primary)] text-sm">{blog.author}</td>
                  <td className="p-4 text-[var(--text-secondary)] text-sm flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> {blog.views}
                  </td>
                  <td className="p-4">
                    {blog.status === 'PUBLISHED' ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">Đã xuất bản</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">Bản nháp</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate.push(`/admin/blogs/edit/${blog.id}`)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-ocean-600)] transition-colors rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
