import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3 shrink-0 group', className)}>
      <div className="w-9 h-9 rounded bg-[#0F294A] flex items-center justify-center text-white shadow-xs">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          {/* Academic Cap / Crest */}
          <path d="M18 4L34 11L18 18L2 11L18 4Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 13.5V23C7 26.5 12 30 18 30C24 30 29 26.5 29 23V13.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 11V22" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="34" cy="23" r="1.5" fill="#93C5FD" />
          <path d="M14 21L18 24L22 21" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-[#0F294A] leading-tight tracking-tight">
          Scholar<span className="text-[#1D4ED8]">Sathi</span>
        </span>
        {subtitle && (
          <span className="text-[10px] font-semibold text-[#515F74] uppercase tracking-wider">
            National Scholarship Gateway
          </span>
        )}
      </div>
    </Link>
  );
}
