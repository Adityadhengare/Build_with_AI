'use client';

import React, { useState } from 'react';
import { AdminNav } from '@/components/layout/admin-nav';
import { Search, ExternalLink, CheckCircle2 } from 'lucide-react';
import { MOCK_APPLICATIONS } from '@/lib/mock/applications';

export default function AdminApplicationsPage() {
  const [query, setQuery] = useState('');

  const filtered = MOCK_APPLICATIONS.filter(
    (a) =>
      a.scholarshipTitle.toLowerCase().includes(query.toLowerCase()) ||
      a.providerName.toLowerCase().includes(query.toLowerCase()) ||
      (a.officialApplicationId && a.officialApplicationId.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex flex-col w-full">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">Application Oversight &amp; Redirection Audit</h1>
          <p className="text-xs md:text-sm text-[#475569] mt-0.5">
            Monitor outbound submissions, official acknowledgement IDs, and application funnel conversion.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications by scheme or external reference ID..."
            className="h-10 w-full pl-10 pr-4 rounded-lg border border-[#CBD5E1] bg-white text-xs md:text-sm text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
          />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2E8F0] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Scheme &amp; Department</th>
                  <th className="py-3 px-4">External Portal ID</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status Stage</th>
                  <th className="py-3 px-4">Official Domain</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F8F9FF] transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-[#0F294A] block truncate">{a.scholarshipTitle}</span>
                      <span className="text-[11px] text-[#64748B] block truncate">{a.providerName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0F294A]">
                      {a.officialApplicationId || 'N/A (Saved)'}
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {a.appliedDate || 'Pending Submission'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#EFF4FF] text-[#1E3A8A] border border-[#BFDBFE]">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <a
                        href={a.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1D4ED8] hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{a.officialPortalUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-bold text-[#15803D] flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
