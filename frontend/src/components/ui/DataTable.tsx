import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface DataTableProps<T> {
  columns: { header: string; accessor: (item: T) => ReactNode; className?: string }[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Không tìm thấy dữ liệu.',
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] overflow-hidden shadow-sm p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[var(--color-ocean-600)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title="Trống" description={emptyMessage} />;
  }

  return (
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 font-medium ${col.className || ''}`}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-main)]">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-[var(--bg-main)] transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`p-4 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="p-4 border-t border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] mt-auto">
          <p className="text-sm text-[var(--text-secondary)] hidden sm:block">
            Trang <span className="font-medium text-[var(--text-primary)]">{currentPage}</span> / <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-[var(--border-main)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-main)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Simple pagination display logic
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page 
                          ? 'bg-[var(--color-ocean-600)] text-white' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
            </div>
            <button 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-[var(--border-main)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-main)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
