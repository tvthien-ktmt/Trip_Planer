'use client';
import { useState } from 'react';
import { Upload, Search, Image as ImageIcon, Video, Folder, Trash2, Edit3 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const mediaFiles = [
    { id: '1', name: 'halong-bay-cover.jpg', type: 'image', size: '2.4 MB', date: '14/10/2023', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=300&auto=format&fit=crop' },
    { id: '2', name: 'kyoto-autumn.jpg', type: 'image', size: '1.8 MB', date: '12/10/2023', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=300&auto=format&fit=crop' },
    { id: '3', name: 'promo-video-2024.mp4', type: 'video', size: '45.5 MB', date: '10/10/2023', url: '' },
    { id: '4', name: 'danang-resort.jpg', type: 'image', size: '3.1 MB', date: '08/10/2023', url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop' },
    { id: '5', name: 'paris-eiffel.jpg', type: 'image', size: '2.9 MB', date: '05/10/2023', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)]">
            Thư viện Media
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Quản lý hình ảnh, video và tài liệu của hệ thống</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsUploading(!isUploading)}>
          <Upload className="w-4 h-4" /> Tải lên tập tin
        </Button>
      </div>

      {isUploading && (
        <div className="bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Tải file mới lên</h3>
            <button onClick={() => setIsUploading(false)} className="text-[var(--text-secondary)] hover:text-red-500 text-sm font-medium">Hủy</button>
          </div>
          <FileUpload onFileSelect={(file) => console.log(file)} label="Kéo thả hình ảnh, video vào đây để upload" />
          <div className="mt-4 flex justify-end">
            <Button variant="primary">Bắt đầu tải lên</Button>
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
                <span className="flex items-center gap-2"><Folder className="w-4 h-4" fill="currentColor" /> Thư mục gốc</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 px-1.5 rounded">128</span>
              </button>
              {/* Nested folders */}
              <ul className="ml-4 mt-1 border-l-2 border-[var(--border-main)] pl-2 space-y-1">
                <li>
                  <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors text-sm">
                    <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5" /> Hình ảnh tour</span>
                    <span className="text-xs">85</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors text-sm">
                    <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5" /> Banner Promo</span>
                    <span className="text-xs">24</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors text-sm">
                    <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5" /> Videos</span>
                    <span className="text-xs">12</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
          <Button variant="outline" size="sm" className="w-full mt-4 text-xs">
            <Folder className="w-3.5 h-3.5 mr-2" /> Tạo thư mục mới
          </Button>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaFiles.map((file) => (
              <div key={file.id} className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] overflow-hidden group hover:border-[var(--color-ocean-600)] hover:shadow-md transition-all">
                <div className="aspect-square bg-[var(--bg-main)] relative flex items-center justify-center">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-3 bg-[var(--bg-surface)] relative">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate pr-6" title={file.name}>{file.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase">{file.type} • {file.size}</p>
                  
                  {/* Actions (visible on hover) */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white shadow text-blue-600 rounded-md hover:bg-blue-50" title="Đổi tên">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 bg-white shadow text-red-600 rounded-md hover:bg-red-50" title="Xóa">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
