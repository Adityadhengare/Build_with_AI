import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'verified' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F294A] focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed select-none rounded cursor-pointer';

    const variants = {
      primary: 'bg-[#0F294A] text-white hover:bg-[#1E3A8A] active:bg-[#00142F] border-transparent shadow-[0_1px_2px_rgba(15,41,74,0.05)]',
      secondary: 'bg-[#F1F5F9] text-[#0F294A] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] border-transparent',
      outline: 'bg-white text-[#0F294A] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#0F294A]',
      verified: 'bg-[#15803D] text-white hover:bg-[#166534] active:bg-[#14532D] border-transparent shadow-[0_1px_2px_rgba(21,128,61,0.1)]',
      destructive: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D] border-transparent',
      ghost: 'bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F294A]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
