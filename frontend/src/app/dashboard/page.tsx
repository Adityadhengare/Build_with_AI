'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { 
  Building2, 
  CheckCircle2, 
  FileText, 
  Hourglass, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Sparkles,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { scholarshipApi } from '@/lib/api/scholarships';
import { profileApi } from '@/lib/api/profile';
import { Scholarship } from '@/types/scholarship';
import { StudentProfile } from '@/types/profile';

export default function DashboardPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH' | 'STATE' | 'CENTRAL' | 'PRIVATE'>('ALL');
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'amount'>('match');
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [schs, prof] = await Promise.all([
        scholarshipApi.getScholarships({ sortBy }),
        profileApi.getProfile(),
      ]);
      setScholarships(schs);
      setProfile(prof);
      setIsLoading(false);
    }
    loadData();
  }, [sortBy]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await profileApi.recalculateMatches();
    const schs = await scholarshipApi.getScholarships({ sortBy });
    setScholarships(schs);
    setIsRecalculating(false);
  };

  const filteredScholarships = scholarships.filter((s) => {
    if (activeTab === 'HIGH') return s.matchScore >= 80;
    if (activeTab === 'STATE') return s.provider.type === 'GOVERNMENT_STATE';
    if (activeTab === 'CENTRAL') return s.provider.type === 'GOVERNMENT_CENTRAL';
    if (activeTab === 'PRIVATE') return s.provider.type === 'PRIVATE_TRUST' || s.provider.type === 'CORPORATE_CSR';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Greeting Banner (Stitch Reference) */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 hidden sm:block">
            <div className="w-14 h-14 rounded-full bg-[#E5EEFF] border border-[#CBD5E1] text-[#0F294A] flex items-center justify-center font-bold text-lg">
              AP
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#15803D] text-white p-0.5 rounded-full flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#0F294A] tracking-tight">
                Good morning, {profile?.fullName || 'Aditya Patil'}
              </h1>
              <span className="bg-[#D5E3FD] text-[#0D1C2F] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#1D4ED8]" /> DigiLocker Synced
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#475569] mt-1">
              Here are scholarships that match your profile:
              <span className="font-semibold text-[#0F294A] bg-[#F1F5F9] px-2 py-0.5 rounded ml-1.5 inline-block">
                B.Tech Computer Science, 3rd Year • OBC • Maharashtra Domicile
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <Settings className="w-3.5 h-3.5 text-[#475569]" />
              <span>Update Profile</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRecalculate}
            isLoading={isRecalculating}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate Matches</span>
          </Button>
        </div>
      </div>

      {/* Document / Renewal Verification Alert Bar */}
      <div className="bg-[#EFF4FF] border border-[#CBD5E1] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#D5E3FD] text-[#0F294A] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#B45309]" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
            <span className="font-bold text-[#0F294A]">Document Verification Alert:</span>
            <span className="text-[#334155]">
              Your Family Income Certificate requires renewal for AY 2026-27. Confirm it in Documents to unlock 3 additional schemes.
            </span>
          </div>
        </div>
        <Link href="/documents" className="text-xs font-bold text-[#0F294A] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center">
          Update Documents →
        </Link>
      </div>

      {/* Main 4 Summary Metric Cards (from Stitch Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Scholarships Found</span>
            <span className="text-2xl md:text-3xl font-bold text-[#0F294A] mt-1">24</span>
            <span className="text-[11px] text-[#64748B] mt-0.5">Across State &amp; Central Schemes</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#EFF4FF] text-[#0F294A] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Highly Eligible</span>
            <span className="text-2xl md:text-3xl font-bold text-[#15803D] mt-1">8</span>
            <span className="text-[11px] text-[#15803D] font-semibold mt-0.5">≥ 80% criteria matched</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Applications Open</span>
            <span className="text-2xl md:text-3xl font-bold text-[#0F294A] mt-1">6</span>
            <span className="text-[11px] text-[#64748B] mt-0.5">Accepting submissions now</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#D5E3FD] text-[#0F294A] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Deadlines Soon</span>
            <span className="text-2xl md:text-3xl font-bold text-[#B91C1C] mt-1">2</span>
            <span className="text-[11px] text-[#B91C1C] font-semibold mt-0.5">Closing in &lt; 25 days</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recommended Scholarships Feed (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Section Header with Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-lg font-bold text-[#0F294A]">Recommended for You</h2>
              <p className="text-xs text-[#64748B]">
                Ranked via deterministic match score, academic marks, and caste income threshold
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-[#64748B]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'match' | 'deadline' | 'amount')}
                className="bg-white border border-[#CBD5E1] text-[#0F294A] text-xs font-semibold py-1.5 px-3 rounded focus:outline-none focus:border-[#0F294A]"
              >
                <option value="match">Highest Eligibility Match</option>
                <option value="deadline">Upcoming Deadline</option>
                <option value="amount">Maximum Grant Amount</option>
              </select>
            </div>
          </div>

          {/* Filter Tab Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL' as const, label: `All Matches (${scholarships.length})` },
              { id: 'HIGH' as const, label: 'High Match (≥80%)' },
              { id: 'STATE' as const, label: 'State Government' },
              { id: 'CENTRAL' as const, label: 'Central Schemes' },
              { id: 'PRIVATE' as const, label: 'Private Trusts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0F294A] text-white shadow-xs'
                    : 'bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scholarships Cards List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="bg-white border border-dashed border-[#CBD5E1] p-8 rounded-xl text-center">
              <p className="text-sm font-semibold text-[#0F294A]">No scholarships in this filter view</p>
              <button
                onClick={() => setActiveTab('ALL')}
                className="text-xs font-bold text-[#1D4ED8] hover:underline mt-2"
              >
                Reset tab filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScholarships.map((sch) => (
                <ScholarshipCard key={sch.id} scholarship={sch} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mini Widgets (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Ask AI Mini Widget */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#EFF4FF] flex items-center justify-center text-[#0F294A]">
                <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F294A]">AI Scholarship Assistant</h3>
                <span className="text-[10px] text-[#64748B]">Grounded in verified government rules</span>
              </div>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Have doubts about documents, fee waivers, or category eligibility? Ask our AI assistant.
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                'Why am I eligible for MahaDBT?',
                'What documents are missing from my vault?',
                'Can I apply for both Govt and CSR grants?',
              ].map((prompt, idx) => (
                <Link
                  key={idx}
                  href={`/assistant?q=${encodeURIComponent(prompt)}`}
                  className="text-xs text-[#0F294A] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded hover:bg-[#EFF4FF] hover:border-[#CBD5E1] transition-colors"
                >
                  &ldquo;{prompt}&rdquo; →
                </Link>
              ))}
            </div>
            <Link href="/assistant" className="mt-1">
              <Button variant="outline" size="sm" className="w-full">
                Open AI Assistant
              </Button>
            </Link>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B45309]" />
                <h3 className="text-sm font-bold text-[#0F294A]">Closing Soon</h3>
              </div>
              <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                Active Windows
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <span className="text-[10px] font-bold text-[#B45309] uppercase block">Closes in 21 days</span>
                <Link href="/scholarships/sch-tata-trusts-engg" className="text-xs font-bold text-[#0F294A] hover:underline line-clamp-1 mt-0.5">
                  Tata Trusts Undergrad Scholarship
                </Link>
                <span className="text-[11px] text-[#64748B] block mt-0.5">Deadline: 25 Oct 2026</span>
              </div>

              <div className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <span className="text-[10px] font-bold text-[#B45309] uppercase block">Closes in 27 days</span>
                <Link href="/scholarships/sch-mahadbt-ebc" className="text-xs font-bold text-[#0F294A] hover:underline line-clamp-1 mt-0.5">
                  MahaDBT Rajarshi Shahu Maharaj Yojna
                </Link>
                <span className="text-[11px] text-[#64748B] block mt-0.5">Deadline: 31 Oct 2026</span>
              </div>
            </div>
          </div>

          {/* Document Vault Status Widget */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0F294A]">Document Vault</h3>
              <span className="text-xs font-bold text-[#15803D]">4 of 5 Verified</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#334155]">Income Certificate</span>
                <span className="text-[#15803D] font-bold flex items-center gap-1">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#334155]">Caste Certificate (OBC)</span>
                <span className="text-[#15803D] font-bold flex items-center gap-1">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#334155]">Domicile Certificate</span>
                <span className="text-[#15803D] font-bold flex items-center gap-1">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#334155]">12th Marksheet</span>
                <span className="text-[#15803D] font-bold flex items-center gap-1">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#334155]">College Bonafide</span>
                <span className="text-[#B45309] font-bold flex items-center gap-1">⚠ In Review</span>
              </div>
            </div>
            <Link href="/documents" className="mt-2">
              <Button variant="outline" size="sm" className="w-full">
                Manage Vault
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
