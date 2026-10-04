import React from 'react';
import { RequiredDocument } from '@/types/scholarship';
import { CheckCircle2, AlertTriangle, Clock, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export function DocumentChecklist({ documents }: { documents: RequiredDocument[] }) {
  return (
    <div className="space-y-3">
      {documents.map((doc, idx) => {
        let statusBadge = (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B]">
            <XCircle className="w-4 h-4 text-[#94A3B8]" />
            Missing
          </span>
        );

        if (doc.userStatus === 'VERIFIED') {
          statusBadge = (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#15803D]">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              Verified in Vault
            </span>
          );
        } else if (doc.userStatus === 'UPLOADED') {
          statusBadge = (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A]">
              <Clock className="w-4 h-4 text-[#1E3A8A]" />
              Uploaded / In Review
            </span>
          );
        } else if (doc.userStatus === 'RENEWAL_NEEDED') {
          statusBadge = (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309]">
              <AlertTriangle className="w-4 h-4 text-[#B45309]" />
              Renewal Required
            </span>
          );
        }

        return (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#F1F5F9] text-[#0F294A] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F294A]">{doc.name}</p>
                <span className="text-[11px] text-[#64748B]">
                  {doc.mandatory ? (
                    <strong className="text-[#B91C1C]">Mandatory document</strong>
                  ) : (
                    'Optional supporting document'
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {statusBadge}
              {doc.userStatus === 'MISSING' && (
                <Link
                  href="/documents"
                  className="text-xs font-bold text-[#0F294A] hover:underline px-2 py-1 rounded bg-[#F1F5F9]"
                >
                  Upload ↗
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
