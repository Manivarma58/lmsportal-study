import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FormGroup = ({ children, className = '' }) => {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
};

export const Label = ({
  children,
  htmlFor,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-1 font-black">*</span>}
    </label>
  );
};

export const Input = React.forwardRef(
  (
    {
      id,
      error = false,
      leftIcon = null,
      rightIcon = null,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full rounded-xl border bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-150 outline-none
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
            disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightIcon ? 'pr-10' : 'pr-3.5'}
            py-2.5
            ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            }
            ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 shrink-0">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef(
  ({ id, error = false, className = '', rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full rounded-xl border bg-white dark:bg-slate-800/80 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
          transition-all duration-150 outline-none
          focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
          disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed
          ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }
          ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(
  ({ id, children, error = false, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full rounded-xl border bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white
          transition-all duration-150 outline-none
          focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
          disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed
          ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }
          ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const FormError = ({ children, className = '' }) => {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={`flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
};

export const FormHelper = ({ children, className = '' }) => {
  if (!children) return null;
  return (
    <p className={`text-[11px] text-slate-500 dark:text-slate-400 ${className}`}>
      {children}
    </p>
  );
};

export default {
  FormGroup,
  Label,
  Input,
  Textarea,
  Select,
  FormError,
  FormHelper,
};
