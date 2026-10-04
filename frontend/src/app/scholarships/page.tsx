'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { FilterSidebar, FilterState } from '@/components/scholarships/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { scholarshipApi } from '@/lib/api/scholarships';
import { Scholarship } from '@/types/scholarship';

function ScholarshipSearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>({
    state: searchParams.get('state') || 'ALL',
    category: searchParams.get('category') || 'ALL',
    education: searchParams.get('education') || 'ALL',
    providerType: searchParams.get('providerType') || 'ALL',
    status: 'ALL',
    minAmount: 0,
  });

  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'amount'>('match');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      const results = await scholarshipApi.getScholarships({
        query,
        state: filters.state,
        category: filters.category,
        education: filters.education,
        providerType: filters.providerType,
        status: filters.status,
        sortBy,
      });
      setScholarships(results);
      setIsLoading(false);
    }

    const timer = setTimeout(() => {
      fetchResults();
    }, 150);

    return () => clearTimeout(timer);
  }, [query, filters, sortBy]);

  const handleFilterChange = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setQuery('');
    setFilters({
      state: 'ALL',
      category: 'ALL',
      education: 'ALL',
      providerType: 'ALL',
      status: 'ALL',
      minAmount: 0,
    });
    setSortBy('match');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Title & Search Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">
          Explore &amp; Search Scholarships
        </h1>
        <p className="text-xs md:text-sm text-[#475569]">
          Search verified central, state government, and corporate CSR scholarships across India.
        </p>
      </div>

      {/* Main Search Input & Mobile Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by scholarship title, provider, field of study (e.g. engineering, OBC)..."
            className="h-11 w-full pl-10 pr-4 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F294A] placeholder:text-[#94A3B8] focus:border-[#0F294A] focus:outline-none focus:ring-1 focus:ring-[#0F294A] shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F294A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <Button
          variant="outline"
          size="md"
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden shrink-0 flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Content Layout: Left Filter Sidebar + Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filter Sidebar (4 Cols) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Results Stream (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Results Summary & Sorting Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#475569]">
              Showing <strong className="text-[#0F294A]">{scholarships.length}</strong> verified scholarships
            </span>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-[#64748B]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'match' | 'deadline' | 'amount')}
                className="bg-white border border-[#CBD5E1] text-[#0F294A] text-xs font-semibold py-1.5 px-3 rounded focus:outline-none focus:border-[#0F294A]"
              >
                <option value="match">Best Profile Match</option>
                <option value="deadline">Upcoming Deadline</option>
                <option value="amount">Highest Grant Amount</option>
              </select>
            </div>
          </div>

          {/* Scholarship Cards List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="bg-white border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center flex flex-col items-center">
              <Search className="w-10 h-10 text-[#94A3B8] mb-3" />
              <h3 className="text-base font-bold text-[#0F294A]">No scholarships found</h3>
              <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-4">
                No schemes matched your search query and filter criteria. Try adjusting state or category filters.
              </p>
              <Button variant="primary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {scholarships.map((sch) => (
                <ScholarshipCard key={sch.id} scholarship={sch} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-xl sm:rounded-xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <h3 className="font-bold text-base text-[#0F294A]">Filter Scholarships</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Button variant="primary" size="md" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {scholarships.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748B]">Loading scholarships...</div>}>
      <ScholarshipSearchContent />
    </Suspense>
  );
}
