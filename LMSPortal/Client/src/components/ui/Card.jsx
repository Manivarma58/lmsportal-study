import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
        glass
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-slate-900 shadow-sm'
      } ${
        hover
          ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
  action = null,
  ...props
}) => {
  return (
    <div
      className={`p-5 sm:p-6 pb-3 sm:pb-4 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 ${className}`}
      {...props}
    >
      <div className="space-y-1 min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => {
  return (
    <Component
      className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p
      className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-5 sm:p-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
