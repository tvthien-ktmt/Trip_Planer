import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number; // For 'text' variant
}

const ShimmerStyle: React.CSSProperties = {
  backgroundImage: 'linear-gradient(90deg, var(--color-mist-50) 0%, #ffffff 50%, var(--color-mist-50) 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite linear',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 3,
}) => {
  const baseClasses = 'rounded-[var(--radius-radius-sm)] dark:opacity-10';

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`} aria-busy="true" aria-label="Đang tải...">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={baseClasses}
            style={{
              ...ShimmerStyle,
              width: i === lines - 1 ? '75%' : width || '100%',
              height: height || '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    const size = width || height || '3rem';
    return (
      <div
        className={`rounded-full ${className}`}
        style={{ ...ShimmerStyle, width: size, height: size }}
        aria-busy="true"
        aria-label="Đang tải..."
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-[var(--radius-radius-md)] overflow-hidden bg-[var(--bg-surface)] shadow-[var(--shadow-shadow-sm)] ${className}`} aria-busy="true" aria-label="Đang tải...">
        {/* Image placeholder — 4:3 ratio */}
        <div className="w-full" style={{ paddingTop: '75%', position: 'relative' }}>
          <div className={`absolute inset-0 ${baseClasses} rounded-none`} style={ShimmerStyle} />
        </div>
        {/* Text lines */}
        <div className="p-4 space-y-2">
          <div className={baseClasses} style={{ ...ShimmerStyle, width: '70%', height: '1rem' }} />
          <div className={baseClasses} style={{ ...ShimmerStyle, width: '50%', height: '0.875rem' }} />
          <div className={baseClasses} style={{ ...ShimmerStyle, width: '40%', height: '1.25rem' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        ...ShimmerStyle,
        width: width || '100%',
        height: height || '1rem',
      }}
      aria-busy="true"
      aria-label="Đang tải..."
    />
  );
};

export default Skeleton;
