import React from 'react';

// RouteLine — Signature Element of Trip Planer
// Renders an SVG dashed arc route line with departure/arrival dots
// Used in card hover, progress bar (booking wizard), and timeline (tour itinerary)

interface RouteLineProps {
  variant?: 'card' | 'progress' | 'timeline';
  className?: string;
  progress?: number; // 0-100, only for variant="progress"
  label?: string;    // departure/arrival label for progress
  color?: string;    // CSS color or var(...)
}

export const RouteLine: React.FC<RouteLineProps> = ({
  variant = 'card',
  className = '',
  progress = 0,
  label = '',
  color = 'var(--color-ocean-600)',
}) => {
  if (variant === 'card') {
    return (
      <svg
        viewBox="0 0 160 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-10 ${className}`}
        aria-hidden="true"
      >
        <circle cx="8" cy="20" r="4" fill={color} />
        <path
          d="M12 20 Q80 4 148 20"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
          className="route-line-path"
        />
        {/* Plane icon at midpoint */}
        <text x="76" y="12" fontSize="10" fill={color} textAnchor="middle">✈</text>
        <circle cx="152" cy="20" r="4" fill={color} />
      </svg>
    );
  }

  if (variant === 'progress') {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    return (
      <div className={`relative w-full ${className}`} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
        {/* Track */}
        <div className="w-full h-0.5 bg-[var(--color-line-200)] rounded-full relative">
          {/* Filled */}
          <div
            className="absolute left-0 top-0 h-0.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${clampedProgress}%`, background: color }}
          />
          {/* Plane icon */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ left: `calc(${clampedProgress}% - 10px)` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill={color} />
            </svg>
          </div>
        </div>
        {label && <span className="text-[var(--text-caption)] text-[var(--text-secondary)] mt-1 block">{label}</span>}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={`relative flex flex-col items-center ${className}`} aria-hidden="true">
        <div className="w-3 h-3 rounded-full border-2 border-[var(--accent-primary)] bg-white z-10" style={{ borderColor: color }} />
        <div className="w-0.5 flex-1 border-l-2 border-dashed my-1" style={{ borderColor: color }} />
      </div>
    );
  }

  return null;
};

export default RouteLine;
