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
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, '...', totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page 
                          ? 'bg-[var(--color-ocean-600)] text-white' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
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
