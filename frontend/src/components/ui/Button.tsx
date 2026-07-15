import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cta' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: any;
  fullWidth?: boolean;
  to?: string;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, as: Component = 'button', fullWidth = false, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-body font-medium transition-custom focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] rounded-[var(--radius-radius-sm)]',
      cta: 'bg-[var(--accent-cta)] text-white shadow-[var(--shadow-shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-shadow-md)] rounded-[var(--radius-radius-sm)]',
      secondary: 'bg-transparent border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--bg-main)] rounded-[var(--radius-radius-sm)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--accent-primary)] rounded-[var(--radius-radius-sm)] border border-transparent hover:bg-black/5 dark:hover:bg-white/5',
      outline: 'bg-transparent border border-[var(--border-main)] hover:bg-[var(--bg-main)] rounded-[var(--radius-radius-sm)]'
    };

    const sizes = {
      sm: 'h-8 px-3 text-[var(--text-caption)]',
      md: 'h-10 px-4 text-[var(--text-body)]',
      lg: 'h-12 px-6 text-[var(--text-body-lg)] font-bold'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <Component
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </Component>
    );
  }
);

Button.displayName = 'Button';
