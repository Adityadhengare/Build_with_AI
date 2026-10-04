'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EligibilityMatrix } from '@/components/scholarships/eligibility-matrix';
import { DocumentChecklist } from '@/components/scholarships/document-checklist';
import { 
  ArrowLeft, 
  ExternalLink, 
  Bookmark, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Coins, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { scholarshipApi } from '@/lib/api/scholarships';
import { applicationsApi } from '@/lib/api/applications';
import { Scholarship } from '@/types/scholarship';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export default function ScholarshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [isTrackingApp, setIsTrackingApp] = useState(false);
  const [trackSuccess, setTrackSuccess] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      try {
        const [data, savedList] = await Promise.all([
          scholarshipApi.getScholarshipById(params.id as string),
          user ? scholarshipApi.getSavedScholarships().catch(() => []) : Promise.resolve([]),
        ]);
        setScholarship(data);
        if (savedList && params.id) {
          setIsSaved(savedList.some((s) => s.id === params.id));
        }
      } catch (err) {
        console.error('Failed to load scholarship details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) {
      loadDetails();
    }
  }, [params.id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      router.push(`/login?redirect=/scholarships/${params.id}`);
      return;
    }
    if (!scholarship) return;

    setIsSavingBookmark(true);
    const nextSavedState = !isSaved;
    try {
      await scholarshipApi.toggleSaveScholarship(scholarship.id, nextSavedState);
      setIsSaved(nextSavedState);
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    } finally {
      setIsSavingBookmark(false);
    }
  };

  const handleTrackApplication = async () => {
    if (!user) {
      router.push(`/login?redirect=/scholarships/${params.id}`);
      return;
    }
    if (!scholarship) return;

    setIsTrackingApp(true);
    try {
      await applicationsApi.createApplication({
        scholarshipId: scholarship.id,
        scholarshipTitle: scholarship.title,
        providerName: scholarship.provider.name,
        providerType: scholarship.provider.type,
        officialPortalUrl: scholarship.officialPortalUrl,
        estimatedAmount: scholarship.financialAssistance,
        status: 'APPLIED',
        appliedDate: new Date().toISOString(),
        notes: 'Initiated application redirect from ScholarSathi portal.',
      });
      setTrackSuccess(true);
      setTimeout(() => setTrackSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to log application:', err);
    } finally {
      setIsTrackingApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#0F294A]">Scholarship Scheme Not Found</h2>
        <p className="text-sm text-[#64748B] mt-1 mb-6">
          The requested scholarship identifier does not exist or has expired.
        </p>
        <Link href="/scholarships">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(scholarship.applicationDeadline);
  const hasFitScore = scholarship.matchScore !== undefined && scholarship.matchScore > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
        <Link href="/scholarships" className="hover:text-[#0F294A] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Scholarships
        </Link>
        <span>/</span>
        <span className="text-[#0F294A] truncate max-w-sm">{scholarship.title}</span>
      </div>

      {/* Main Scheme Header Institutional Banner Card */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EFF4FF] border border-[#CBD5E1] text-[#0F294A] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              {scholarship.provider.name}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#F1F5F9] text-[#334155] text-xs font-bold uppercase">
              AY {scholarship.academicYear}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-xs font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse"></span>
              Status: Applications Open
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              disabled={isSavingBookmark}
              className={`p-2 rounded border border-[#E2E8F0] transition-colors cursor-pointer ${
                isSaved ? 'bg-[#D5E3FD] text-[#0F294A]' : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#0F294A]' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="p-2 rounded border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              title="Copy Scheme Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-bold text-[#515F74] uppercase tracking-wider">
              {scholarship.provider.type === 'GOVERNMENT_STATE' ? 'State Government Scheme' : 'National Scheme'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F294A] leading-tight">
              {scholarship.title}
            </h1>
            <p className="text-sm md:text-base text-[#475569] leading-relaxed pt-1 max-w-4xl">
              {scholarship.description}
            </p>
          </div>

          {/* Fit Score Badge Box */}
          <div className="lg:w-72 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold uppercase">
              <span className="text-[#64748B]">Profile Match</span>
              {hasFitScore ? (
                scholarship.matchScore >= 80 ? (
                  <span className="text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                    HIGH MATCH
                  </span>
                ) : (
                  <span className="text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FCD34D]">
                    PARTIAL MATCH
                  </span>
                )
              ) : (
                <span className="text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">
                  UNEVALUATED
                </span>
              )}
            </div>
            {hasFitScore ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#0F294A]">{scholarship.matchScore}%</span>
                  <span className="text-xs text-[#64748B]">Deterministic Fit</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#15803D] h-full rounded-full transition-all duration-700"
                    style={{ width: `${scholarship.matchScore}%` }}
                  ></div>
                </div>
                <span className="text-xs text-[#475569] flex items-center gap-1 mt-1 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  Verified against your student profile
                </span>
              </>
            ) : (
              <div className="text-xs text-[#475569] py-1">
                <Link href={user ? '/onboarding' : '/login'} className="font-bold text-[#1D4ED8] hover:underline">
                  {user ? 'Complete profile' : 'Sign in'}
                </Link>{' '}
                to calculate your eligibility score.
              </div>
            )}
          </div>
        </div>

        {/* Key Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#E2E8F0]">
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#475569]">
              <Coins className="w-4 h-4" />
              <span className="text-xs uppercase font-bold text-[#64748B]">Scholarship Benefit</span>
            </div>
            <div className="text-sm md:text-base font-bold text-[#0F294A]">
              {scholarship.financialAssistance}
            </div>
            <span className="text-xs text-[#64748B]">Direct Benefit Transfer / Grant</span>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#B45309]">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase font-bold text-[#B45309]">Application Deadline</span>
            </div>
            <div className="text-sm md:text-base font-bold text-[#0F294A]">
              {formatDate(scholarship.applicationDeadline)}
            </div>
            <span className="text-xs font-bold text-[#B45309] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {daysLeft >= 0 ? `${daysLeft} days remaining` : 'Application closed'}
            </span>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#475569]">
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs uppercase font-bold text-[#64748B]">Designated Portal</span>
            </div>
            <div className="text-sm md:text-base font-bold text-[#0F294A] truncate">
              {scholarship.provider.name}
            </div>
            <a
              href={scholarship.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1D4ED8] underline truncate hover:text-[#0F294A]"
            >
              {scholarship.officialPortalUrl}
            </a>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#15803D]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs uppercase font-bold text-[#15803D]">Filing Charges</span>
            </div>
            <div className="text-sm md:text-base font-bold text-[#15803D]">
              ₹0 (Nil Fee)
            </div>
            <span className="text-xs text-[#64748B]">Free Official Service</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Eligibility Matrix & Document Checklist */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Your Eligibility Match Matrix */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#15803D] uppercase bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                    Automated Verification
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {user ? 'Synced with Your Profile' : 'Catalog Rules'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0F294A] mt-1">Eligibility Criteria Breakdown</h2>
              </div>
            </div>

            {scholarship.criteria && scholarship.criteria.length > 0 ? (
              <EligibilityMatrix criteria={scholarship.criteria} />
            ) : (
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#475569]">
                {scholarship.eligibilitySummary || 'Review official criteria on provider portal.'}
              </div>
            )}
          </section>

          {/* Section 2: Required Documents Checklist */}
          {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0F294A]">Required Documents Checklist</h2>
                  <p className="text-xs text-[#64748B]">
                    Have these scanned certificates ready in PDF format before opening the official portal.
                  </p>
                </div>
                <Link href="/documents" className="text-xs font-bold text-[#0F294A] hover:underline">
                  Upload to Vault →
                </Link>
              </div>

              <DocumentChecklist documents={scholarship.requiredDocuments} />
            </section>
          )}
        </div>

        {/* Right Column (4 cols): Sticky Action Card & Official Portal Redirection */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-5">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#64748B] uppercase">Application Window</span>
              <span className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                Closes {formatDate(scholarship.applicationDeadline)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#64748B]">Maximum Scholarship Grant</span>
              <span className="text-2xl font-bold text-[#0F294A]">{scholarship.financialAssistance}</span>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="verified"
              size="lg"
              onClick={() => setShowRedirectModal(true)}
              className="w-full flex items-center justify-center gap-2 mt-2 font-bold"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </Button>

            {user && (
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={handleTrackApplication}
                isLoading={isTrackingApp}
              >
                Track in My Applications
              </Button>
            )}

            {trackSuccess && (
              <div className="p-2 bg-[#DCFCE7] border border-[#86EFAC] text-xs font-bold text-[#15803D] rounded text-center">
                Added to Application Tracker!
              </div>
            )}

            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] leading-relaxed">
              <strong>Official Redirection Disclaimer:</strong> ScholarSathi never charges application fees. Submissions occur directly on verified government or CSR domains.
            </div>
          </div>
        </div>
      </div>

      {/* Official Portal External Redirection Disclaimer Modal */}
      <Modal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        title="Leaving ScholarSathi for Official Portal"
        description="You are being redirected to the designated government/foundation portal."
      >
        <div className="space-y-4 text-xs text-[#475569]">
          <p>
            You are about to visit the official website:
            <strong className="block text-sm text-[#0F294A] mt-1 break-all bg-[#F1F5F9] p-2 rounded">
              {scholarship.officialPortalUrl}
            </strong>
          </p>
          <div className="p-3 bg-[#EFF4FF] border border-[#CBD5E1] rounded text-[#0F294A]">
            <p className="font-bold mb-1">Before you proceed:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure your required certificates are ready.</li>
              <li>Note down your application acknowledgment number to track status on ScholarSathi.</li>
              <li>Never pay any fee to external agents. Government applications are free of charge.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" size="sm" onClick={() => setShowRedirectModal(false)}>
              Cancel
            </Button>
            <a
              href={scholarship.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setShowRedirectModal(false);
                if (user) {
                  handleTrackApplication();
                }
              }}
            >
              <Button variant="verified" size="sm" className="flex items-center gap-1.5">
                <span>Continue to Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
