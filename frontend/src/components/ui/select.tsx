import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#334155] uppercase tracking-wider">
            {label}
            {props.required && <span className="text-[#B91C1C] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-10 w-full rounded border bg-white px-3 py-2 text-sm text-[#0F294A] transition-colors',
            'border-[#CBD5E1] focus:border-[#0F294A] focus:outline-none focus:ring-1 focus:ring-[#0F294A]',
            'disabled:cursor-not-allowed disabled:bg-[#F8FAFC]',
            error && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs font-medium text-[#B91C1C]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
