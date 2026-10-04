'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Scholarship } from '@/types/scholarship';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export function ScholarshipCard({
  scholarship,
  onSaveToggle,
  isSaved = false,
}: {
  scholarship: Scholarship;
  onSaveToggle?: (id: string, saved: boolean) => void;
  isSaved?: boolean;
}) {
  const [saved, setSaved] = useState(isSaved);
  const daysLeft = getDaysRemaining(scholarship.applicationDeadline);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onSaveToggle?.(scholarship.id, next);
  };

  const getProviderBadge = (type: string) => {
    switch (type) {
      case 'GOVERNMENT_CENTRAL':
        return 'Central Government (NSP)';
      case 'GOVERNMENT_STATE':
        return `State Govt (${scholarship.provider.state || 'State'})`;
      case 'CORPORATE_CSR':
        return 'Corporate CSR Grant';
      case 'PRIVATE_TRUST':
        return 'Private Philanthropic Trust';
      default:
        return 'Verified Scheme';
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 md:p-6 transition-all hover:border-[#CBD5E1] shadow-[0_1px_2px_rgba(15,41,74,0.04)] flex flex-col justify-between gap-4">
      {/* Top Header Row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
              {getProviderBadge(scholarship.provider.type)}
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">
              AY {scholarship.academicYear}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleSave}
            type="button"
            className={`p-1.5 rounded transition-colors ${
              saved ? 'text-[#0F294A] bg-[#D5E3FD]' : 'text-[#94A3B8] hover:text-[#0F294A] hover:bg-[#F1F5F9]'
            }`}
            title={saved ? 'Remove bookmark' : 'Bookmark scholarship'}
            aria-label="Bookmark scholarship"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#0F294A]' : ''}`} />
          </button>
        </div>

        {/* Title & Provider */}
        <div>
          <Link href={`/scholarships/${scholarship.id}`} className="group">
            <h3 className="text-base md:text-lg font-bold text-[#0F294A] group-hover:text-[#1D4ED8] transition-colors leading-snug">
              {scholarship.title}
            </h3>
          </Link>
          <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            <span>{scholarship.provider.name}</span>
          </p>
        </div>
      </div>

      {/* Description Snippet */}
      <p className="text-xs md:text-sm text-[#475569] line-clamp-2 leading-relaxed">
        {scholarship.description}
      </p>

      {/* Financial Assistance & Match Banner */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-[11px] uppercase font-semibold text-[#64748B] block">Benefit</span>
          <span className="text-sm font-bold text-[#0F294A]">{scholarship.financialAssistance}</span>
        </div>

        {/* Match Indicator */}
        <div className="text-right">
          {scholarship.matchStatus === 'ELIGIBLE' && (
            <Badge variant="eligible" size="sm" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {scholarship.matchScore}% Match
            </Badge>
          )}
          {scholarship.matchStatus === 'LIKELY_ELIGIBLE' && (
            <Badge variant="warning" size="sm" className="gap-1">
              <Clock className="w-3 h-3" />
              {scholarship.matchScore}% Likely
            </Badge>
          )}
          {scholarship.matchStatus === 'NEEDS_VERIFICATION' && (
            <Badge variant="warning" size="sm">
              Needs Verification
            </Badge>
          )}
          {scholarship.matchStatus === 'NOT_ELIGIBLE' && (
            <Badge variant="error" size="sm">
              Not Eligible
            </Badge>
          )}
        </div>
      </div>

      {/* Footer Details & Action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Calendar className="w-4 h-4 text-[#475569]" />
          <span>Deadline: <strong className="text-[#0F294A]">{formatDate(scholarship.applicationDeadline)}</strong></span>
          {daysLeft > 0 && daysLeft <= 25 && (
            <span className="text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded ml-1">
              {daysLeft}d left
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/scholarships/${scholarship.id}`}>
          <Button variant="primary" size="sm" className="w-full sm:w-auto">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
