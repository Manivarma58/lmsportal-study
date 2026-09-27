import React from 'react';

const colorVariants = {
  indigo: {
    bar: 'bg-gradient-to-r from-indigo-600 to-blue-500',
    glow: 'shadow-[0_0_12px_rgba(79,70,229,0.35)]',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  cyan: {
    bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  emerald: {
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    text: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bar: 'bg-gradient-to-r from-rose-500 to-pink-500',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
    text: 'text-rose-600 dark:text-rose-400',
  },
  purple: {
    bar: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    glow: 'shadow-[0_0_12px_rgba(147,51,234,0.35)]',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

const sizeVariants = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'indigo',
  showLabel = false,
  label = null,
  showPercentage = false,
  animated = false,
  glow = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((Number(value) / Number(max)) * 100) || 0));
  const activeColor = colorVariants[color] || colorVariants.indigo;
  const activeSize = sizeVariants[size] || sizeVariants.md;

  return (
    <div className={`w-full flex flex-col gap-1.5 select-none ${className}`}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {showLabel && (
            <span className="text-slate-600 dark:text-slate-400">
              {label || 'Progress'}
            </span>
          )}
          {showPercentage && (
            <span className={`font-mono font-semibold ${activeColor.text}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${activeSize}`}
      >
        <div
          style={{ width: `${percentage}%` }}
          className={`${activeSize} rounded-full transition-all duration-500 ease-out ${activeColor.bar} ${
            glow ? activeColor.glow : ''
          } ${animated ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
