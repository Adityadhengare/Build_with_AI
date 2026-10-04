'use client';

import React from 'react';
import { Select } from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';

export interface FilterState {
  state: string;
  category: string;
  education: string;
  providerType: string;
  status: string;
  minAmount: number;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
}: {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}) {
  const states = [
    { value: 'ALL', label: 'All India & All States' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Delhi', label: 'Delhi (NCT)' },
  ];

  const categories = [
    { value: 'ALL', label: 'All Social Categories' },
    { value: 'OBC', label: 'OBC (Other Backward Class)' },
    { value: 'SC', label: 'SC (Scheduled Caste)' },
    { value: 'ST', label: 'ST (Scheduled Tribe)' },
    { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
    { value: 'GENERAL', label: 'General / Open Merit' },
  ];

  const providerTypes = [
    { value: 'ALL', label: 'All Provider Types' },
    { value: 'GOVERNMENT_CENTRAL', label: 'Central Government (NSP)' },
    { value: 'GOVERNMENT_STATE', label: 'State Government (State DBT)' },
    { value: 'CORPORATE_CSR', label: 'Corporate CSR Foundations' },
    { value: 'PRIVATE_TRUST', label: 'Private Philanthropic Trusts' },
  ];

  const educationLevels = [
    { value: 'ALL', label: 'All Education Levels' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate (B.Tech, B.Sc, MBBS, etc.)' },
    { value: 'POSTGRADUATE', label: 'Postgraduate (M.Tech, M.Sc, MBA, etc.)' },
    { value: 'DIPLOMA', label: 'Polytechnic & Diploma' },
    { value: 'CLASS_12', label: 'Class 11 & 12 (Higher Secondary)' },
    { value: 'CLASS_10', label: 'Class 10 (Secondary)' },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <h3 className="font-bold text-base text-[#0F294A]">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Domicile State */}
      <div>
        <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1.5">
          Domicile State
        </label>
        <Select
          value={filters.state}
          onChange={(e) => onChange('state', e.target.value)}
          options={states}
        />
      </div>

      {/* Social Category */}
      <div>
        <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1.5">
          Social Category
        </label>
        <Select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          options={categories}
        />
      </div>

      {/* Education Level */}
      <div>
        <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1.5">
          Education Level
        </label>
        <Select
          value={filters.education}
          onChange={(e) => onChange('education', e.target.value)}
          options={educationLevels}
        />
      </div>

      {/* Provider Type */}
      <div>
        <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1.5">
          Provider Type
        </label>
        <Select
          value={filters.providerType}
          onChange={(e) => onChange('providerType', e.target.value)}
          options={providerTypes}
        />
      </div>

      {/* Quick Verified Chips */}
      <div className="pt-2 border-t border-[#E2E8F0]">
        <span className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-2">
          Special Preferences
        </span>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
            <input type="checkbox" className="rounded border-[#CBD5E1] text-[#0F294A] focus:ring-[#0F294A]" />
            <span>Girls in STEM / Women Only</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
            <input type="checkbox" className="rounded border-[#CBD5E1] text-[#0F294A] focus:ring-[#0F294A]" />
            <span>Persons with Disabilities (PwD)</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
            <input type="checkbox" className="rounded border-[#CBD5E1] text-[#0F294A] focus:ring-[#0F294A]" />
            <span>Aadhaar DBT Direct Transfer</span>
          </label>
        </div>
      </div>
    </div>
  );
}
