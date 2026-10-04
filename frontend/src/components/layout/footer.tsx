import React from 'react';
import Link from 'next/link';
import { Logo } from './logo';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E2E8F0] mt-auto">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <Logo />
            <p className="text-xs text-[#515F74] leading-relaxed max-w-sm mt-1">
              ScholarSathi is an open digital public good connecting Indian students with legitimate central, state, and corporate CSR scholarships. We provide deterministic eligibility checks, document AI assistance, and direct official application routing.
            </p>
            <div className="flex items-center gap-2 mt-2 px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#475569] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>Aligned with Digital Personal Data Protection Act (DPDPA 2023)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F294A]">Scholarships</h4>
            <Link href="/scholarships?category=GOVERNMENT_CENTRAL" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              National Scholarships (NSP)
            </Link>
            <Link href="/scholarships?state=Maharashtra" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              State Government Schemes
            </Link>
            <Link href="/scholarships?category=CORPORATE_CSR" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Corporate CSR Grants
            </Link>
            <Link href="/scholarships" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Full Scholarship Catalog
            </Link>
          </div>

          {/* Student Hub */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F294A]">Student Tools</h4>
            <Link href="/dashboard" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Eligibility Dashboard
            </Link>
            <Link href="/assistant" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              AI Scholarship Assistant
            </Link>
            <Link href="/documents" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Document Vault &amp; OCR
            </Link>
            <Link href="/applications" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Application Tracker
            </Link>
          </div>

          {/* Institutional Integrity & Admin */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F294A]">Governance</h4>
            <Link href="/admin/login" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Officer Admin Login
            </Link>
            <Link href="/admin/dashboard" className="text-xs text-[#515F74] hover:text-[#0F294A] hover:underline">
              Platform Metrics
            </Link>
            <span className="text-xs text-[#94A3B8]">Privacy Policy</span>
            <span className="text-xs text-[#94A3B8]">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-[#64748B]">
          <p>© 2026 ScholarSathi. Built for the students of India. Not a commercial intermediary.</p>
          <p>ScholarSathi redirects students to official government and philanthropic domains only.</p>
        </div>
      </div>
    </footer>
  );
}
