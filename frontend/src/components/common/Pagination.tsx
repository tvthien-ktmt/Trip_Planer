import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => Math.max(1, Math.min(currentPage - 2 + i, totalPages)));

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-10 h-10 rounded-md font-medium transition-colors",
            currentPage === page 
              ? "bg-blue-600 text-white" 
              : "border hover:bg-gray-100"
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 disabled:hover:bg-transparent"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
