import React from 'react';
import { EligibilityCriterion } from '@/types/scholarship';
import { CheckCircle2, XCircle } from 'lucide-react';

export function EligibilityMatrix({ criteria }: { criteria: EligibilityCriterion[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2E8F0] text-xs uppercase tracking-wider font-semibold">
            <th className="py-3 px-4">Eligibility Requirement</th>
            <th className="py-3 px-4">Scheme Threshold / Official Rule</th>
            <th className="py-3 px-4">Your Profile Value</th>
            <th className="py-3 px-4 text-right">Verification Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {criteria.map((item, idx) => (
            <tr key={idx} className="hover:bg-[#F8F9FF] transition-colors">
              <td className="py-3 px-4 font-bold text-[#0F294A]">{item.label}</td>
              <td className="py-3 px-4 text-[#475569]">{item.requirement}</td>
              <td className="py-3 px-4 text-[#0F294A] font-medium">{item.userValue}</td>
              <td className="py-3 px-4 text-right">
                {item.isMet ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Match
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
                    <XCircle className="w-3.5 h-3.5" />
                    Not Met
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
