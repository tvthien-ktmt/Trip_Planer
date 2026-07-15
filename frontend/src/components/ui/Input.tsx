import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[var(--text-caption)] font-medium text-[var(--text-primary)] mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              block w-full rounded-[var(--radius-radius-sm)] bg-[var(--bg-surface)] text-[var(--text-primary)]
              border transition-custom
              font-body text-[var(--text-body)]
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:bg-[var(--bg-main)] disabled:cursor-not-allowed
              ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--border-main)] focus:ring-[var(--color-ocean-600)]'}
              ${leftIcon ? 'pl-10' : 'pl-3'}
              ${rightIcon ? 'pr-10' : 'pr-3'}
              py-2.5
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1.5 flex items-center text-[var(--color-danger)] text-[var(--text-caption)]">
            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
