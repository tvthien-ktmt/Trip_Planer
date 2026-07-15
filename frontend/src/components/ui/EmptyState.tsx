import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon = <Inbox className="w-12 h-12 text-[var(--text-secondary)] opacity-50" />, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-surface)] border border-dashed border-[var(--border-main)] rounded-[var(--radius-radius-md)] min-h-[300px]">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
