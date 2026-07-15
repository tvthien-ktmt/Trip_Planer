import { FolderSearch } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export const EmptyState = ({ title, description, className }: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FolderSearch className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );
};
