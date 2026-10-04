'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { 
  User, 
  GraduationCap, 
  Award, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { profileApi } from '@/lib/api/profile';
import { documentsApi } from '@/lib/api/documents';
import { DocumentType } from '@/types/document';

function OnboardingContent() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states - completely empty initial states, defaulting name/email from Firebase Auth
  const [personal, setPersonal] = useState({
    fullName: user?.displayName || '',
    phone: '',
    dob: '',
    gender: 'MALE',
    state: 'Maharashtra',
    district: '',
    isDomicile: 'YES',
  });

  const [education, setEducation] = useState({
    level: 'UNDERGRADUATE',
    college: '',
    boardOrUniversity: '',
    course: '',
    branch: '',
    year: '1',
    marks: '',
    gradingScale: 'PERCENTAGE',
  });

  const [eligibility, setEligibility] = useState({
    category: 'GENERAL',
    annualIncome: '',
    parentOccupation: '',
    isDisabled: 'NO',
    disabilityPercentage: '',
    minorityStatus: 'NO',
  });

  const [selectedFiles, setSelectedFiles] = useState<{ [key in DocumentType]?: File }>({});

  useEffect(() => {
    if (user?.displayName && !personal.fullName) {
      setPersonal((prev) => ({ ...prev, fullName: user.displayName || '' }));
    }
  }, [user]);

  const handleFileChange = (docType: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles((prev) => ({
        ...prev,
        [docType]: e.target.files![0],
      }));
    }
  };

  const handleNext = async () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!personal.fullName.trim() || !personal.district.trim()) {
        setErrorMsg('Please enter your full name and district.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!education.college.trim() || !education.course.trim() || !education.marks.trim()) {
        setErrorMsg('Please enter your college name, degree course, and aggregate marks.');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      if (!eligibility.annualIncome.trim()) {
        setErrorMsg('Please enter your family annual income.');
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 4: Final submission
      setIsLoading(true);
      try {
        // 1. Save Profile
        await profileApi.updateProfile({
          fullName: personal.fullName.trim(),
          phone: personal.phone.trim(),
          dob: personal.dob || undefined,
          gender: personal.gender as any,
          domicileState: personal.state,
          domicileDistrict: personal.district.trim(),
          category: eligibility.category as any,
          religion: 'OTHER',
          familyAnnualIncome: parseFloat(eligibility.annualIncome) || 0,
          parentOccupation: eligibility.parentOccupation.trim() || 'General',
          isDisabled: eligibility.isDisabled === 'YES',
          disabilityPercentage: eligibility.disabilityPercentage ? parseFloat(eligibility.disabilityPercentage) : undefined,
          minorityStatus: eligibility.minorityStatus === 'YES',
          profileCompleteness: 100,
          education: {
            currentLevel: education.level as any,
            institutionName: education.college.trim(),
            institutionState: personal.state,
            boardOrUniversity: education.boardOrUniversity.trim() || education.college.trim(),
            courseName: education.course.trim(),
            specialization: education.branch.trim() || 'General',
            currentYearOrSemester: parseInt(education.year, 10) || 1,
            passingYear: 2026 + (4 - (parseInt(education.year, 10) || 1)),
            percentageOrCgpa: parseFloat(education.marks) || 0,
            gradingScale: (education.gradingScale as any) || 'PERCENTAGE',
          },
        });

        // 2. Upload any certificates selected in onboarding
        const uploadPromises = Object.entries(selectedFiles).map(([docType, file]) => {
          if (file) {
            return documentsApi.uploadDocument(file, docType as DocumentType).catch(() => null);
          }
          return Promise.resolve(null);
        });
        await Promise.all(uploadPromises);

        // 3. Refresh user profile in Auth context
        await refreshProfile();

        // 4. Redirect to Dashboard
        router.push('/dashboard');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to complete profile. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Education', icon: GraduationCap },
    { num: 3, title: 'Eligibility', icon: Award },
    { num: 4, title: 'Documents', icon: UploadCloud },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">
          Complete Your Student Profile
        </h1>
        <p className="text-xs md:text-sm text-[#475569] mt-1">
          Accurate information ensures deterministic matching with government and private scholarships.
        </p>
      </div>

      {/* Progress Indicator Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E2E8F0] -translate-y-1/2 z-0" />
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs',
                    isCompleted && 'bg-[#15803D] text-white',
                    isCurrent && 'bg-[#0F294A] text-white ring-4 ring-[#D5E3FD]',
                    !isCompleted && !isCurrent && 'bg-white border border-[#CBD5E1] text-[#64748B]'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-bold mt-2 uppercase tracking-wider',
                    isCurrent ? 'text-[#0F294A]' : 'text-[#64748B]'
                  )}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] rounded-lg text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Step Card Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-xs">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F294A]">Personal &amp; Domicile Information</h2>
              <p className="text-xs text-[#64748B]">State of domicile is critical for state government DBT scholarship quotas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                placeholder="Enter your full name as per Aadhaar/10th marksheet"
                value={personal.fullName}
                onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                required
              />

              <Input
                label="Mobile Phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={personal.dob}
                onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
              />

              <Select
                label="Gender"
                value={personal.gender}
                onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female (Eligible for Girl-Child Schemes)' },
                  { value: 'TRANSGENDER', label: 'Transgender' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="State of Domicile (Permanent Residence)"
                value={personal.state}
                onChange={(e) => setPersonal({ ...personal, state: e.target.value })}
                options={[
                  { value: 'Maharashtra', label: 'Maharashtra' },
                  { value: 'Karnataka', label: 'Karnataka' },
                  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                  { value: 'Odisha', label: 'Odisha' },
                  { value: 'Delhi', label: 'Delhi (NCT)' },
                  { value: 'Bihar', label: 'Bihar' },
                  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                  { value: 'Gujarat', label: 'Gujarat' },
                  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
                  { value: 'Rajasthan', label: 'Rajasthan' },
                  { value: 'West Bengal', label: 'West Bengal' },
                ]}
              />

              <Input
                label="District"
                placeholder="e.g. Pune, Bangalore Urban, Lucknow"
                value={personal.district}
                onChange={(e) => setPersonal({ ...personal, district: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Education Information */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F294A]">Academic &amp; Course Enrollment</h2>
              <p className="text-xs text-[#64748B]">Used to evaluate degree eligibility and minimum aggregate marks cutoffs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Education Level"
                value={education.level}
                onChange={(e) => setEducation({ ...education, level: e.target.value })}
                options={[
                  { value: 'UNDERGRADUATE', label: 'Undergraduate (B.Tech, B.Sc, B.Com, MBBS)' },
                  { value: 'POSTGRADUATE', label: 'Postgraduate (M.Tech, M.Sc, MBA)' },
                  { value: 'DIPLOMA', label: 'Diploma / Polytechnic' },
                  { value: 'CLASS_12', label: 'Class 12 (Higher Secondary)' },
                  { value: 'CLASS_10', label: 'Class 10 (Secondary)' },
                ]}
              />

              <Input
                label="College / Institute Full Name"
                placeholder="e.g. COEP Technological University, Pune"
                value={education.college}
                onChange={(e) => setEducation({ ...education, college: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Affiliated Board / University"
                placeholder="e.g. SPPU, AICTE, CBSE"
                value={education.boardOrUniversity}
                onChange={(e) => setEducation({ ...education, boardOrUniversity: e.target.value })}
              />

              <Input
                label="Degree / Course Name"
                placeholder="e.g. B.Tech, B.Sc Computer Science"
                value={education.course}
                onChange={(e) => setEducation({ ...education, course: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Branch / Specialization"
                placeholder="e.g. Computer Science, Mechanical"
                value={education.branch}
                onChange={(e) => setEducation({ ...education, branch: e.target.value })}
              />

              <Select
                label="Current Year of Study"
                value={education.year}
                onChange={(e) => setEducation({ ...education, year: e.target.value })}
                options={[
                  { value: '1', label: '1st Year' },
                  { value: '2', label: '2nd Year' },
                  { value: '3', label: '3rd Year' },
                  { value: '4', label: '4th Year' },
                  { value: '5', label: '5th Year' },
                ]}
              />

              <Input
                label="Aggregate Score (%) / CGPA"
                type="number"
                step="0.1"
                placeholder="e.g. 78.5"
                value={education.marks}
                onChange={(e) => setEducation({ ...education, marks: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {/* Step 3: Eligibility & Category Parameters */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F294A]">Socio-Economic &amp; Quota Parameters</h2>
              <p className="text-xs text-[#64748B]">These parameters determine reservation quotas and means-based financial aid ceilings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Social Category / Caste Group"
                value={eligibility.category}
                onChange={(e) => setEligibility({ ...eligibility, category: e.target.value })}
                options={[
                  { value: 'GENERAL', label: 'General / Open Merit' },
                  { value: 'OBC', label: 'OBC (Other Backward Class)' },
                  { value: 'SC', label: 'SC (Scheduled Caste)' },
                  { value: 'ST', label: 'ST (Scheduled Tribe)' },
                  { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
                ]}
              />

              <Input
                label="Total Annual Family Income (₹ INR)"
                type="number"
                placeholder="e.g. 235000"
                value={eligibility.annualIncome}
                onChange={(e) => setEligibility({ ...eligibility, annualIncome: e.target.value })}
                helperText="Gross annual income from all sources as stated on your income certificate."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Primary Parent / Guardian Occupation"
                placeholder="e.g. Farmer, Salaried, Small Business"
                value={eligibility.parentOccupation}
                onChange={(e) => setEligibility({ ...eligibility, parentOccupation: e.target.value })}
              />

              <Select
                label="Person with Disability (PwD)?"
                value={eligibility.isDisabled}
                onChange={(e) => setEligibility({ ...eligibility, isDisabled: e.target.value })}
                options={[
                  { value: 'NO', label: 'No' },
                  { value: 'YES', label: 'Yes (≥40% Disability)' },
                ]}
              />

              <Select
                label="Belong to Religious Minority Community?"
                value={eligibility.minorityStatus}
                onChange={(e) => setEligibility({ ...eligibility, minorityStatus: e.target.value })}
                options={[
                  { value: 'NO', label: 'No' },
                  { value: 'YES', label: 'Yes (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 4: Documents Upload & AI Extraction Teaser */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in-0 duration-200">
            <div className="border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F294A]">Document Verification Vault</h2>
              <p className="text-xs text-[#64748B]">
                Upload certificates to enable server-side Gemini information extraction. You may also skip and upload later in Documents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Income Certificate */}
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F294A]">Family Income Certificate</span>
                  <span className="text-[10px] font-bold text-[#15803D] uppercase bg-[#DCFCE7] px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">Issued by Tahsildar / SDO for AY 2026-27 (Max 5MB PDF/JPG)</p>
                {selectedFiles.INCOME_CERTIFICATE ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedFiles.INCOME_CERTIFICATE.name}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Certificate</span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange('INCOME_CERTIFICATE', e)} />
                  </label>
                )}
              </div>

              {/* Caste Certificate */}
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F294A]">Caste Certificate / Validity</span>
                  <span className="text-[10px] font-bold text-[#15803D] uppercase bg-[#DCFCE7] px-2 py-0.5 rounded">
                    Required for Quota
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">OBC / SC / ST Certificate from competent authority</p>
                {selectedFiles.CASTE_CERTIFICATE ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedFiles.CASTE_CERTIFICATE.name}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Certificate</span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange('CASTE_CERTIFICATE', e)} />
                  </label>
                )}
              </div>

              {/* Domicile Certificate */}
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F294A]">State Domicile Certificate</span>
                  <span className="text-[10px] font-bold text-[#334155] uppercase bg-[#F1F5F9] px-2 py-0.5 rounded">
                    State Quotas
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">Proof of permanent state residency</p>
                {selectedFiles.DOMICILE_CERTIFICATE ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedFiles.DOMICILE_CERTIFICATE.name}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Domicile Proof</span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange('DOMICILE_CERTIFICATE', e)} />
                  </label>
                )}
              </div>

              {/* Marksheet */}
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F294A]">Academic Marksheet</span>
                  <span className="text-[10px] font-bold text-[#334155] uppercase bg-[#F1F5F9] px-2 py-0.5 rounded">
                    Marks Cutoff
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">12th Board or latest semester grade card</p>
                {selectedFiles.MARKSHEET_12TH ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedFiles.MARKSHEET_12TH.name}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Marksheet</span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange('MARKSHEET_12TH', e)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E2E8F0]">
          {currentStep > 1 ? (
            <Button type="button" onClick={handleBack} variant="outline" size="md">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div></div>
          )}

          <Button type="button" onClick={handleNext} variant="primary" size="md" isLoading={isLoading}>
            <span>{currentStep === 4 ? 'Finish & Save Profile' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
