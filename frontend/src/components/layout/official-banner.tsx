import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function OfficialBanner() {
  return (
    <div className="w-full bg-[#EFF4FF] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-7 text-[11px] font-semibold text-[#475569]">
        <div className="flex items-center gap-2">
          {/* Indian Tricolor Emblem Strip */}
          <div className="flex items-center h-2.5 w-6 rounded-[1px] overflow-hidden shadow-xs border border-black/10">
            <div className="h-full w-1/3 bg-[#FF9933]"></div>
            <div className="h-full w-1/3 bg-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#000080]"></div>
            </div>
            <div className="h-full w-1/3 bg-[#138808]"></div>
          </div>
          <span className="truncate">
            An Open Digital Public Good for Student Scholarship Discovery | Government &amp; Verified Private Schemes
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[#0F294A] shrink-0 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
          <span>Official National Repository</span>
        </div>
      </div>
    </div>
  );
}
