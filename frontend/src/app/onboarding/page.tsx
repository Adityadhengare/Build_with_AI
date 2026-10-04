'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [personal, setPersonal] = useState({
    fullName: 'Aditya Patil',
    dob: '2004-06-18',
    gender: 'MALE',
    state: 'Maharashtra',
    district: 'Pune',
    isDomicile: 'YES',
  });

  const [education, setEducation] = useState({
    level: 'UNDERGRADUATE',
    college: 'Government College of Engineering, Pune (COEP)',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '3',
    marks: '78.4',
    gradingScale: 'PERCENTAGE',
  });

  const [eligibility, setEligibility] = useState({
    category: 'OBC',
    annualIncome: '235000',
    parentOccupation: 'Farmer / Small Business',
    isDisabled: 'NO',
    minorityStatus: 'NO',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({
    incomeCert: 'Income_Certificate_2026.pdf',
    casteCert: 'OBC_Certificate.pdf',
    domicileCert: 'Domicile_Maharashtra.pdf',
  });

  const handleFileUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles((prev) => ({
        ...prev,
        [docType]: e.target.files![0].name,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 700);
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
          Accurate information ensures 100% deterministic matching with government and private scholarships.
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
                label="Full Name (as per certificates)"
                value={personal.fullName}
                onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={personal.dob}
                onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Gender"
                value={personal.gender}
                onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'TRANSGENDER', label: 'Transgender' },
                ]}
              />
              <Select
                label="State of Domicile"
                value={personal.state}
                onChange={(e) => setPersonal({ ...personal, state: e.target.value })}
                options={[
                  { value: 'Maharashtra', label: 'Maharashtra' },
                  { value: 'Karnataka', label: 'Karnataka' },
                  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                  { value: 'Odisha', label: 'Odisha' },
                  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                  { value: 'Gujarat', label: 'Gujarat' },
                  { value: 'West Bengal', label: 'West Bengal' },
                ]}
              />
              <Input
                label="District"
                value={personal.district}
                onChange={(e) => setPersonal({ ...personal, district: e.target.value })}
                required
              />
            </div>

            <div>
              <Select
                label="Do you have a valid State Domicile Certificate?"
                value={personal.isDomicile}
                onChange={(e) => setPersonal({ ...personal, isDomicile: e.target.value })}
                options={[
                  { value: 'YES', label: 'Yes, issued by Executive Magistrate / Tehsildar' },
                  { value: 'NO', label: 'No / In Application Process' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F294A]">Current Academic Profile</h2>
              <p className="text-xs text-[#64748B]">Your educational level and academic marks determine cutoffs and fee waiver caps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Current Education Level"
                value={education.level}
                onChange={(e) => setEducation({ ...education, level: e.target.value })}
                options={[
                  { value: 'UNDERGRADUATE', label: 'Undergraduate Degree (B.Tech, B.Sc, MBBS)' },
                  { value: 'POSTGRADUATE', label: 'Postgraduate Degree (M.Tech, M.Sc, MBA)' },
                  { value: 'DIPLOMA', label: 'Polytechnic & Diploma' },
                  { value: 'CLASS_12', label: 'Class 12th' },
                  { value: 'CLASS_10', label: 'Class 10th' },
                ]}
              />
              <Input
                label="Institution / College Name"
                value={education.college}
                onChange={(e) => setEducation({ ...education, college: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Course / Degree"
                value={education.course}
                onChange={(e) => setEducation({ ...education, course: e.target.value })}
                placeholder="e.g. B.Tech"
                required
              />
              <Input
                label="Branch / Specialization"
                value={education.branch}
                onChange={(e) => setEducation({ ...education, branch: e.target.value })}
                placeholder="e.g. Computer Science"
                required
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
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Previous Qualifying Percentage (%)"
                type="number"
                step="0.1"
                value={education.marks}
                onChange={(e) => setEducation({ ...education, marks: e.target.value })}
                helperText="Aggregate percentage obtained in Class 12 or last semester"
                required
              />
              <Select
                label="Grading System"
                value={education.gradingScale}
                onChange={(e) => setEducation({ ...education, gradingScale: e.target.value })}
                options={[
                  { value: 'PERCENTAGE', label: 'Percentage (%)' },
                  { value: 'CGPA_10', label: 'CGPA (Out of 10)' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 3: Eligibility & Income */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            <div className="border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F294A]">Socio-Economic &amp; Eligibility Factors</h2>
              <p className="text-xs text-[#64748B]">All income and category information is processed securely under the DPDPA 2023.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Social Category (Caste / Quota)"
                value={eligibility.category}
                onChange={(e) => setEligibility({ ...eligibility, category: e.target.value })}
                options={[
                  { value: 'OBC', label: 'OBC (Other Backward Class)' },
                  { value: 'SC', label: 'SC (Scheduled Caste)' },
                  { value: 'ST', label: 'ST (Scheduled Tribe)' },
                  { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
                  { value: 'GENERAL', label: 'General / Open' },
                ]}
              />
              <Input
                label="Annual Family Income (INR ₹)"
                type="number"
                value={eligibility.annualIncome}
                onChange={(e) => setEligibility({ ...eligibility, annualIncome: e.target.value })}
                helperText="Total income from all sources as mentioned in Tehsildar certificate"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Parent Occupation"
                value={eligibility.parentOccupation}
                onChange={(e) => setEligibility({ ...eligibility, parentOccupation: e.target.value })}
              />
              <Select
                label="Person with Disability (PwD)"
                value={eligibility.isDisabled}
                onChange={(e) => setEligibility({ ...eligibility, isDisabled: e.target.value })}
                options={[
                  { value: 'NO', label: 'No' },
                  { value: 'YES', label: 'Yes (40% or more with UDID)' },
                ]}
              />
              <Select
                label="Religious Minority Status"
                value={eligibility.minorityStatus}
                onChange={(e) => setEligibility({ ...eligibility, minorityStatus: e.target.value })}
                options={[
                  { value: 'NO', label: 'No' },
                  { value: 'YES', label: 'Yes (Muslim, Christian, Sikh, Jain, Parsi)' },
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
                {uploadedFiles.incomeCert ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{uploadedFiles.incomeCert}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Certificate</span>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload('incomeCert', e)} />
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
                {uploadedFiles.casteCert ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{uploadedFiles.casteCert}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Certificate</span>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload('casteCert', e)} />
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
                {uploadedFiles.domicileCert ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{uploadedFiles.domicileCert}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Domicile Proof</span>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload('domicileCert', e)} />
                  </label>
                )}
              </div>

              {/* 12th Marksheet */}
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F294A]">Academic Marksheet</span>
                  <span className="text-[10px] font-bold text-[#334155] uppercase bg-[#F1F5F9] px-2 py-0.5 rounded">
                    Marks Cutoff
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">12th Board or latest semester grade card</p>
                {uploadedFiles.marksheet ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#86EFAC] text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{uploadedFiles.marksheet}</span>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-white border border-dashed border-[#CBD5E1] text-xs font-semibold text-[#0F294A] hover:bg-[#F1F5F9] cursor-pointer">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Marksheet</span>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload('marksheet', e)} />
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
            <span>{currentStep === 4 ? 'Finish & View Matches' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
