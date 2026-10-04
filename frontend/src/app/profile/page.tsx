'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { 
  User, 
  GraduationCap, 
  Award, 
  RefreshCw, 
  CheckCircle2, 
  Save
} from 'lucide-react';
import { profileApi } from '@/lib/api/profile';
import { StudentProfile } from '@/types/profile';
import { formatINR } from '@/lib/utils';

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    await profileApi.updateProfile(profile);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await profileApi.recalculateMatches();
    setIsRecalculating(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E5EEFF] border border-[#CBD5E1] text-[#0F294A] flex items-center justify-center font-bold text-xl shrink-0">
            AP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-[#0F294A]">{profile.fullName}</h1>
              <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> DigiLocker Verified
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {profile.education.courseName} ({profile.education.specialization}) • {profile.education.institutionName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            isLoading={isRecalculating}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate Matches</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] text-xs font-bold text-[#15803D] rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile information saved successfully. Matches updated.</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Information */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <User className="w-5 h-5 text-[#0F294A]" />
            <h2 className="text-base font-bold text-[#0F294A]">Personal &amp; Demographic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
            <Input
              label="Mobile Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            />
            <Select
              label="Gender"
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER' })}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'TRANSGENDER', label: 'Transgender' },
              ]}
            />
            <Select
              label="Domicile State"
              value={profile.domicileState}
              onChange={(e) => setProfile({ ...profile, domicileState: e.target.value })}
              options={[
                { value: 'Maharashtra', label: 'Maharashtra' },
                { value: 'Karnataka', label: 'Karnataka' },
                { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                { value: 'Odisha', label: 'Odisha' },
                { value: 'Delhi', label: 'Delhi (NCT)' },
              ]}
            />
          </div>
        </section>

        {/* Section 2: Education Profile */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <GraduationCap className="w-5 h-5 text-[#0F294A]" />
            <h2 className="text-base font-bold text-[#0F294A]">Academic &amp; College Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="College / Institute Name"
              value={profile.education.institutionName}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  education: { ...profile.education, institutionName: e.target.value },
                })
              }
              required
            />
            <Input
              label="Affiliated Board / University"
              value={profile.education.boardOrUniversity}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  education: { ...profile.education, boardOrUniversity: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Degree / Course"
              value={profile.education.courseName}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  education: { ...profile.education, courseName: e.target.value },
                })
              }
              required
            />
            <Input
              label="Specialization / Branch"
              value={profile.education.specialization}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  education: { ...profile.education, specialization: e.target.value },
                })
              }
              required
            />
            <Input
              label="Aggregate Marks / Percentage (%)"
              type="number"
              step="0.1"
              value={profile.education.percentageOrCgpa}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  education: { ...profile.education, percentageOrCgpa: parseFloat(e.target.value) || 0 },
                })
              }
              required
            />
          </div>
        </section>

        {/* Section 3: Socio-Economic Eligibility */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Award className="w-5 h-5 text-[#0F294A]" />
            <h2 className="text-base font-bold text-[#0F294A]">Eligibility &amp; Category Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Social Category"
              value={profile.category}
              onChange={(e) => setProfile({ ...profile, category: e.target.value as 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' })}
              options={[
                { value: 'OBC', label: 'OBC (Other Backward Class)' },
                { value: 'SC', label: 'SC (Scheduled Caste)' },
                { value: 'ST', label: 'ST (Scheduled Tribe)' },
                { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
                { value: 'GENERAL', label: 'General / Open' },
              ]}
            />
            <Input
              label="Family Annual Income (₹ INR)"
              type="number"
              value={profile.familyAnnualIncome}
              onChange={(e) =>
                setProfile({ ...profile, familyAnnualIncome: parseFloat(e.target.value) || 0 })
              }
              helperText={`Currently evaluated as ${formatINR(profile.familyAnnualIncome)} per year`}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Person with Disability (PwD)"
              value={profile.isDisabled ? 'YES' : 'NO'}
              onChange={(e) => setProfile({ ...profile, isDisabled: e.target.value === 'YES' })}
              options={[
                { value: 'NO', label: 'No' },
                { value: 'YES', label: 'Yes' },
              ]}
            />
            <Select
              label="Religious Minority"
              value={profile.minorityStatus ? 'YES' : 'NO'}
              onChange={(e) => setProfile({ ...profile, minorityStatus: e.target.value === 'YES' })}
              options={[
                { value: 'NO', label: 'No' },
                { value: 'YES', label: 'Yes' },
              ]}
            />
          </div>
        </section>

        {/* Save CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
