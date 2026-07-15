'use client';
import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, File, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUpload({ onFileSelect, accept = 'image/*,application/pdf', maxSizeMB = 5, label = 'Kéo thả file vào đây hoặc click để tải lên' }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File quá lớn. Vui lòng chọn file dưới ${maxSizeMB}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div 
      className={`relative p-6 border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer 
        ${dragActive ? 'border-[var(--color-ocean-600)] bg-blue-50 dark:bg-blue-900/10' : 'border-[var(--border-main)] bg-[var(--bg-main)] hover:bg-[var(--bg-surface)]'}
        ${selectedFile ? 'border-solid border-[var(--color-ocean-600)] bg-[var(--bg-surface)]' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !selectedFile && inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept={accept}
        onChange={handleChange}
      />

      {!selectedFile ? (
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <UploadCloud className="w-10 h-10 text-[var(--color-ocean-500)]" />
          <p className="font-medium text-[var(--text-primary)]">{label}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Hỗ trợ: {accept} (Tối đa {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-left">
          {preview ? (
            <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-[var(--border-main)]" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-main)]">
              {selectedFile.type.includes('image') ? <ImageIcon className="w-6 h-6 text-gray-400" /> : <File className="w-6 h-6 text-gray-400" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{selectedFile.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            type="button"
            onClick={clearFile}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
