'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { 
  Building2, 
  CheckCircle2, 
  FileText, 
  Hourglass, 
  RefreshCw, 
  Settings, 
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { scholarshipApi } from '@/lib/api/scholarships';
import { profileApi } from '@/lib/api/profile';
import { documentsApi } from '@/lib/api/documents';
import { applicationsApi } from '@/lib/api/applications';
import { Scholarship } from '@/types/scholarship';
import { StudentProfile } from '@/types/profile';
import { StudentDocument } from '@/types/document';
import { ApplicationRecord } from '@/types/application';
import { formatDate, getDaysRemaining } from '@/lib/utils';

function DashboardContent() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH' | 'STATE' | 'CENTRAL' | 'PRIVATE'>('ALL');
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'amount'>('match');
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [schs, prof, docs, apps] = await Promise.all([
          scholarshipApi.getScholarships({ sortBy }),
          profileApi.getProfile().catch(() => null),
          documentsApi.getDocuments().catch(() => []),
          applicationsApi.getApplications().catch(() => []),
        ]);
        setScholarships(schs || []);
        setProfile(prof);
        setDocuments(docs || []);
        setApplications(apps || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [sortBy]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await profileApi.recalculateMatches().catch(() => null);
    const schs = await scholarshipApi.getScholarships({ sortBy });
    setScholarships(schs || []);
    setIsRecalculating(false);
  };

  const filteredScholarships = scholarships.filter((s) => {
    if (activeTab === 'HIGH') return (s.matchScore || 0) >= 80;
    if (activeTab === 'STATE') return s.provider.type === 'GOVERNMENT_STATE';
    if (activeTab === 'CENTRAL') return s.provider.type === 'GOVERNMENT_CENTRAL';
    if (activeTab === 'PRIVATE') return s.provider.type === 'PRIVATE_TRUST' || s.provider.type === 'CORPORATE_CSR';
    return true;
  });

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Student';
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

  const highlyEligibleCount = scholarships.filter((s) => (s.matchScore || 0) >= 80).length;
  const verifiedDocsCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const closingSoonScholarships = scholarships.filter((s) => {
    const days = getDaysRemaining(s.applicationDeadline);
    return days >= 0 && days <= 30;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Greeting Banner */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 hidden sm:block">
            <div className="w-14 h-14 rounded-full bg-[#E5EEFF] border border-[#CBD5E1] text-[#0F294A] flex items-center justify-center font-bold text-lg">
              {userInitials}
            </div>
            {verifiedDocsCount > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-[#15803D] text-white p-0.5 rounded-full flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#0F294A] tracking-tight">
                Good morning, {displayName}
              </h1>
              {verifiedDocsCount > 0 ? (
                <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2 py-0.5 rounded border border-[#86EFAC] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#15803D]" /> {verifiedDocsCount} Docs Verified
                </span>
              ) : (
                <span className="bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  Account Active
                </span>
              )}
            </div>
            {profile?.education?.courseName ? (
              <p className="text-xs md:text-sm text-[#475569] mt-1">
                Here are scholarships matching your profile:
                <span className="font-semibold text-[#0F294A] bg-[#F1F5F9] px-2 py-0.5 rounded ml-1.5 inline-block">
                  {profile.education.courseName} • {profile.category} • {profile.domicileState} Domicile
                </span>
              </p>
            ) : (
              <p className="text-xs md:text-sm text-[#475569] mt-1">
                Complete your profile to unlock deterministic eligibility matching.
              </p>
            )}
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

      {/* Profile Incomplete Banner if user has not completed onboarding */}
      {(!profile || (profile.profileCompleteness || 0) < 70) && (
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#92400E]">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#B45309]" />
            <div>
              <span className="font-bold">Your profile is incomplete!</span> Complete your personal, academic, and category details to receive 100% verified scholarship eligibility matches.
            </div>
          </div>
          <Link href="/onboarding" className="shrink-0">
            <Button variant="primary" size="sm" className="bg-[#B45309] hover:bg-[#92400E] border-none text-white">
              Complete Profile Now
            </Button>
          </Link>
        </div>
      )}

      {/* Main 4 Summary Metric Cards (Derived strictly from real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Scholarships Found</span>
            <span className="text-2xl md:text-3xl font-bold text-[#0F294A] mt-1">{scholarships.length}</span>
            <span className="text-[11px] text-[#64748B] mt-0.5">In catalog</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#EFF4FF] text-[#0F294A] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Highly Eligible</span>
            <span className="text-2xl md:text-3xl font-bold text-[#15803D] mt-1">{highlyEligibleCount}</span>
            <span className="text-[11px] text-[#15803D] font-semibold mt-0.5">≥ 80% criteria matched</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">My Applications</span>
            <span className="text-2xl md:text-3xl font-bold text-[#0F294A] mt-1">{applications.length}</span>
            <span className="text-[11px] text-[#64748B] mt-0.5">Tracked by you</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#D5E3FD] text-[#0F294A] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Deadlines Soon</span>
            <span className="text-2xl md:text-3xl font-bold text-[#B91C1C] mt-1">{closingSoonScholarships.length}</span>
            <span className="text-[11px] text-[#B91C1C] font-semibold mt-0.5">Closing in ≤ 30 days</span>
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
              { id: 'ALL' as const, label: `All Schemes (${scholarships.length})` },
              { id: 'HIGH' as const, label: `High Match (${highlyEligibleCount})` },
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
            <div className="bg-white border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center">
              <p className="text-base font-bold text-[#0F294A]">No scholarships found</p>
              <p className="text-xs text-[#64748B] mt-1 mb-4">
                {activeTab === 'HIGH' && (!profile || (profile.profileCompleteness || 0) < 70)
                  ? 'Complete your profile to calculate your personalized eligibility match score.'
                  : 'No scholarships matched this filter category.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('ALL')}
              >
                Show All Schemes
              </Button>
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
                'Which scholarships match my profile?',
                'What documents do I need for state scholarships?',
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

            {closingSoonScholarships.length === 0 ? (
              <p className="text-xs text-[#64748B] py-2">No deadlines closing in the next 30 days.</p>
            ) : (
              <div className="space-y-3">
                {closingSoonScholarships.slice(0, 3).map((sch) => {
                  const days = getDaysRemaining(sch.applicationDeadline);
                  return (
                    <div key={sch.id} className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                      <span className="text-[10px] font-bold text-[#B45309] uppercase block">
                        Closes in {days} {days === 1 ? 'day' : 'days'}
                      </span>
                      <Link href={`/scholarships/${sch.id}`} className="text-xs font-bold text-[#0F294A] hover:underline line-clamp-1 mt-0.5">
                        {sch.title}
                      </Link>
                      <span className="text-[11px] text-[#64748B] block mt-0.5">
                        Deadline: {formatDate(sch.applicationDeadline)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Document Vault Status Widget */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0F294A]">Document Vault</h3>
              <span className="text-xs font-bold text-[#15803D]">
                {verifiedDocsCount} of {documents.length} Verified
              </span>
            </div>
            {documents.length === 0 ? (
              <div className="text-xs text-[#64748B] py-2">
                No certificates uploaded yet. Upload your income and caste certificates to enable instant eligibility confirmation.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <span className="text-[#334155] truncate max-w-[170px]">{doc.title}</span>
                    {doc.status === 'VERIFIED' ? (
                      <span className="text-[#15803D] font-bold flex items-center gap-1 shrink-0">✓ Verified</span>
                    ) : doc.status === 'NEEDS_REVIEW' ? (
                      <span className="text-[#B45309] font-bold flex items-center gap-1 shrink-0">⚠ In Review</span>
                    ) : (
                      <span className="text-[#1D4ED8] font-bold flex items-center gap-1 shrink-0">Processing</span>
                    )}
                  </div>
                ))}
              </div>
            )}
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
