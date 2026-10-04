import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#334155] uppercase tracking-wider">
            {label}
            {props.required && <span className="text-[#B91C1C] ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'h-10 w-full rounded border bg-white px-3 py-2 text-sm text-[#0F294A] transition-colors',
            'border-[#CBD5E1] placeholder:text-[#94A3B8]',
            'focus:border-[#0F294A] focus:outline-none focus:ring-1 focus:ring-[#0F294A]',
            'disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]',
            error && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-[#64748B]">{helperText}</p>}
        {error && <p className="text-xs font-medium text-[#B91C1C]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
