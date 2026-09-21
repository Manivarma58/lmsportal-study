import React from 'react';

export const ResponsiveTable = ({
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm scrollbar-thin ${containerClassName}`}
    >
      <table
        className={`w-full text-left border-collapse text-xs sm:text-sm ${className}`}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <thead
      className={`bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] ${className}`}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody
      className={`divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200 ${className}`}
    >
      {children}
    </tbody>
  );
};

export const TableRow = ({
  children,
  className = '',
  hover = true,
  onClick = null,
}) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${
        hover ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHeaderCell = ({ children, className = '' }) => {
  return <th className={`p-4 font-bold ${className}`}>{children}</th>;
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`p-4 align-middle text-slate-700 dark:text-slate-300 ${className}`}>
      {children}
    </td>
  );
};

export default {
  ResponsiveTable,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
};
