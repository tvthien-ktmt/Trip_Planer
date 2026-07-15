import React from 'react';
import { RouteLine } from '../ui/RouteLine';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'destination' | 'tour';
  image?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'base', image, badge, children, ...props }, ref) => {
    
    if (variant === 'destination' || variant === 'tour') {
      return (
        <div
          ref={ref}
          className={`group relative rounded-[var(--radius-radius-md)] overflow-hidden shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)] transition-custom bg-[var(--bg-surface)] border border-[var(--border-main)] flex flex-col ${className}`}
          {...props}
        >
          {image && (
            <div className="relative overflow-hidden w-full aspect-[4/3]">
              <img
                src={image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ filter: "saturate(1.05) contrast(1.02)" }}
              />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, rgba(20,20,22,0.80) 0%, rgba(20,20,22,0.1) 60%, transparent 100%)"
              }} />
              
              {badge && (
                <div className="absolute top-3 left-3">
                  {badge}
                </div>
              )}

              {/* RouteLine overlay on hover for tour variant */}
              {variant === 'tour' && (
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-custom">
                  <RouteLine variant="card" color="rgba(232,163,61,0.9)" />
                </div>
              )}
            </div>
          )}
          
          <div className={`p-[var(--spacing-space-5)] flex-1 flex flex-col ${!image ? 'pt-[var(--spacing-space-5)]' : ''}`}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)] transition-custom border border-[var(--border-main)] p-[var(--spacing-space-5)] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
