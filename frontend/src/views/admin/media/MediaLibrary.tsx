'use client';
import { useState, useEffect } from 'react';
import { Upload, Search, Image as ImageIcon, Video, Folder, Trash2, Edit3, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get('/upload/media');
      setMediaFiles(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Không thể tải thư viện media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      uploadingFiles.forEach(file => {
        formData.append('files', file);
      });

      await api.post('/upload/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Tải lên thành công');
      setIsUploading(false);
      setUploadingFiles([]);
      fetchMedia();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tải lên tệp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;
    try {
      await api.delete(`/upload/media/${id}`);
      toast.success('Đã xóa tệp');
      fetchMedia();
    } catch (err) {
      toast.error('Lỗi khi xóa tệp');
    }
  };

  const filteredMedia = mediaFiles.filter(f => 
    f.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)]">
            Thư viện Media
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Quản lý hình ảnh, video và tài liệu của hệ thống</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => { setIsUploading(!isUploading); setUploadingFiles([]); }}>
          <Upload className="w-4 h-4" /> Tải lên tập tin
        </Button>
      </div>

      {isUploading && (
        <div className="bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Tải file mới lên</h3>
            <button onClick={() => setIsUploading(false)} className="text-[var(--text-secondary)] hover:text-red-500 text-sm font-medium">Hủy</button>
          </div>
          <FileUpload 
            onFileSelect={(file) => setUploadingFiles(prev => [...prev, file])} 
            label="Kéo thả hình ảnh vào đây để upload" 
          />
          {uploadingFiles.length > 0 && (
            <div className="mt-4 text-sm text-[var(--text-secondary)]">
              Đã chọn: {uploadingFiles.map(f => f.name).join(', ')}
            </div>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="primary" onClick={handleUpload} disabled={isSubmitting || uploadingFiles.length === 0} className="flex items-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Đang tải lên...' : 'Bắt đầu tải lên'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tree View */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] self-start">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 px-2">Cấu trúc thư mục</h3>
          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center justify-between px-2 py-2 rounded-lg bg-blue-50 text-[var(--color-ocean-600)] dark:bg-blue-900/20 font-medium">
                <span className="flex items-center gap-2"><Folder className="w-4 h-4" fill="currentColor" /> Tất cả tập tin</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 px-1.5 rounded">{mediaFiles.length}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <div className="bg-[var(--bg-surface)] p-3 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tập tin..." 
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">Đang tải...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl">Không có tập tin nào</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedia.map((file) => (
                <div key={file.id} className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] overflow-hidden group hover:border-[var(--color-ocean-600)] hover:shadow-md transition-all">
                  <div className="aspect-square bg-[var(--bg-main)] relative flex items-center justify-center overflow-hidden">
                    {file.mimeType?.startsWith('image') ? (
                      <img src={file.fileUrl} alt={file.originalName} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-3 bg-[var(--bg-surface)] relative">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate pr-6" title={file.originalName}>{file.originalName}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase">{file.mimeType?.split('/')[1] || 'FILE'} • {(file.fileSize / 1024).toFixed(1)} KB</p>
                    
                    {/* Actions (visible on hover) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(file.id)} className="p-1.5 bg-white shadow text-red-600 rounded-md hover:bg-red-50" title="Xóa">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
