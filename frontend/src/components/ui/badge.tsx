import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'eligible' | 'warning' | 'error' | 'neutral' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'sm', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-bold uppercase tracking-wider rounded transition-colors';

  const variants = {
    eligible: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]',
    error: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]',
    neutral: 'bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]',
    info: 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]',
    outline: 'bg-transparent text-[#475569] border border-[#CBD5E1]',
  };

  const sizes = {
    sm: 'text-[11px] h-6 px-2 gap-1 leading-none',
    md: 'text-xs h-7 px-2.5 gap-1.5 leading-none',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
