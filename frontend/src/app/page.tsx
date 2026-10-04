'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Award, 
  FileCheck, 
  Lock, 
  ChevronRight, 
  School, 
  Wrench, 
  Users 
} from 'lucide-react';
import { scholarshipApi } from '@/lib/api/scholarships';
import { Scholarship } from '@/types/scholarship';

export default function LandingPage() {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedCategory, setSelectedCategory] = useState('OBC');
  const [selectedLevel, setSelectedLevel] = useState('UNDERGRADUATE');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadScholarships() {
      setIsLoading(true);
      try {
        const data = await scholarshipApi.getScholarships();
        setScholarships(data || []);
      } catch (err) {
        console.error('Failed to load scholarships on landing page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadScholarships();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/scholarships?state=${selectedState}&category=${selectedCategory}&education=${selectedLevel}`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full bg-white border-b border-[#E2E8F0] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E5EEFF] border border-[#CBD5E1] rounded mb-4">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F294A]">
                  Verified National &amp; State Scholarship Portal
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F294A] tracking-tight leading-[1.15] mb-4">
                Find scholarships you are <span className="text-[#1D4ED8]">actually eligible for</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#475569] mb-8 leading-relaxed max-w-xl">
                Tell us about yourself and we will help you discover government and private scholarships that match your education, category, income, and academic performance.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-6">
                <Link href="/onboarding" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    <span>Find My Scholarships</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/scholarships" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Search className="w-4 h-4 text-[#475569]" />
                    <span>Browse Catalog</span>
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                <Lock className="w-4 h-4 text-[#15803D]" />
                <span>Free for all Indian students. 100% verified official application portals.</span>
              </div>

              {/* Trust Metrics Strip */}
              <div className="w-full grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#E2E8F0] bg-[#F8FAFC] p-4 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-[#0F294A]">Verified</span>
                  <span className="text-xs text-[#64748B]">Official DBT Schemes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-[#0F294A]">{scholarships.length} Active</span>
                  <span className="text-xs text-[#64748B]">Live Catalog Schemes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-[#0F294A]">Deterministic</span>
                  <span className="text-xs text-[#64748B]">Rules Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Catalog Preview */}
            <div className="lg:col-span-6 relative">
              <div className="bg-[#EFF4FF] border border-[#CBD5E1] rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 bg-white px-4 py-2.5 rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse"></span>
                    <span className="text-xs sm:text-sm font-bold text-[#0F294A]">Active Schemes (Live Catalog)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#D5E3FD] text-[#0D1C2F] text-[11px] font-bold">
                    {scholarships.length} Available
                  </span>
                </div>

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : scholarships.length === 0 ? (
                    <div className="p-6 bg-white rounded-lg text-center text-xs text-[#64748B]">
                      Loading verified schemes from database...
                    </div>
                  ) : (
                    scholarships.slice(0, 3).map((sch) => (
                      <Link
                        key={sch.id}
                        href={`/scholarships/${sch.id}`}
                        className="block bg-white border border-[#E2E8F0] rounded-lg p-4 transition-all hover:border-[#0F294A] shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                            {sch.provider.name}
                          </span>
                          <span className="text-xs font-bold text-[#15803D]">
                            {sch.financialAssistance}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F294A] line-clamp-1 mb-2">
                          {sch.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#475569]">
                          <span className="px-2 py-0.5 bg-[#F1F5F9] rounded border border-[#E2E8F0]">
                            {sch.provider.type === 'GOVERNMENT_STATE' ? 'State Government' : 'National Scheme'}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F1F5F9] rounded border border-[#E2E8F0]">
                            AY {sch.academicYear}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-3 flex items-center justify-between text-xs text-[#475569] border-t border-[#CBD5E1] px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                    Grounded in official state &amp; central regulations
                  </span>
                  <Link href="/scholarships" className="text-[#0F294A] hover:underline font-bold flex items-center gap-0.5">
                    View Catalog →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Teaser Form */}
      <section className="w-full bg-[#F8FAFC] border-b border-[#E2E8F0] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleQuickSearch} className="bg-white border border-[#E2E8F0] rounded-xl p-5 md:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#0F294A]" />
              <h3 className="text-sm md:text-base font-bold text-[#0F294A]">
                Quick Eligibility Check by Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
                  Domicile State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="h-10 w-full rounded border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F294A] focus:border-[#0F294A] focus:outline-none"
                >
                  <option value="ALL">All India (Pan-India)</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi (NCT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
                  Social Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 w-full rounded border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F294A] focus:border-[#0F294A] focus:outline-none"
                >
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="GENERAL">General / Open</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
                  Current Education
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-10 w-full rounded border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F294A] focus:border-[#0F294A] focus:outline-none"
                >
                  <option value="UNDERGRADUATE">Undergraduate (B.Tech, B.Sc, MBBS)</option>
                  <option value="POSTGRADUATE">Postgraduate (M.Tech, MBA)</option>
                  <option value="DIPLOMA">Diploma / Polytechnic</option>
                  <option value="CLASS_12">Class 12 (Higher Secondary)</option>
                  <option value="CLASS_10">Class 10 (Secondary)</option>
                </select>
              </div>

              <div>
                <Button type="submit" variant="primary" size="md" className="w-full">
                  <span>Check Schemes</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Schemes & Focus Domains */}
      <section className="w-full bg-white border-b border-[#E2E8F0] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#515F74] uppercase tracking-wider block mb-1">
                Browse Categorized Streams
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F294A] tracking-tight">
                Popular Streams &amp; Quotas
              </h2>
            </div>
            <Link href="/scholarships" className="text-sm font-bold text-[#0F294A] hover:underline flex items-center gap-1">
              View all verified schemes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: School, title: 'Post-Matric Schemes', filter: 'Post-Matric' },
              { icon: Wrench, title: 'Engineering & Tech', filter: 'Engineering' },
              { icon: Users, title: 'Girls in STEM', filter: 'Girls' },
              { icon: Award, title: 'Merit-cum-Means', filter: 'Merit' },
              { icon: ShieldCheck, title: 'SC / ST / OBC Quotas', filter: 'OBC' },
              { icon: Building2, title: 'Corporate CSR Grants', filter: 'CORPORATE_CSR' },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/scholarships?q=${cat.filter}`}
                  className="bg-white border border-[#E2E8F0] p-4 rounded-lg hover:border-[#0F294A] transition-all group flex flex-col justify-between h-32 shadow-xs"
                >
                  <div className="w-9 h-9 rounded bg-[#EFF4FF] flex items-center justify-center text-[#0F294A] group-hover:bg-[#0F294A] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-[#0F294A] leading-snug">{cat.title}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-[#F8FAFC] border-b border-[#E2E8F0] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#515F74] uppercase tracking-wider block mb-1">
              Deterministic &amp; AI-Guided
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F294A] tracking-tight">
              How ScholarSathi Works
            </h2>
            <p className="text-sm text-[#475569] mt-2">
              From automated certificate extraction to guaranteed rules-based matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Enter your education, state domicile, social category, and family annual income.',
                icon: GraduationCap,
              },
              {
                step: '02',
                title: 'Document AI Extraction',
                description: 'Upload your income or caste certificate. Server-side Gemini extracts verifiable parameters.',
                icon: FileCheck,
              },
              {
                step: '03',
                title: 'Deterministic Matching',
                description: 'Backend engine evaluates hard cutoffs, income ceilings, and category quotas with zero false hopes.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Apply on Official Portals',
                description: 'Direct links to official government and trust portals. We never charge any processing fee.',
                icon: ArrowRight,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-white border border-[#E2E8F0] p-6 rounded-xl flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] font-mono">STEP {step.step}</span>
                    <div className="w-8 h-8 rounded bg-[#EFF4FF] flex items-center justify-center text-[#0F294A]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#0F294A]">{step.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Scholarships Grid */}
      <section className="w-full bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#515F74] uppercase tracking-wider block mb-1">
                Verified Listings
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F294A] tracking-tight">
                Featured Scholarships Open for AY 2026-27
              </h2>
            </div>
            <Link href="/scholarships">
              <Button variant="outline" size="sm">
                <span>View Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center">
              <p className="text-sm font-semibold text-[#0F294A]">No scholarships listed yet</p>
              <p className="text-xs text-[#64748B] mt-1">Scholarships will appear here once added to the portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.slice(0, 3).map((sch) => (
                <div key={sch.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-[#CBD5E1] transition-all shadow-xs">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="neutral" size="sm">
                        {sch.provider.type === 'GOVERNMENT_STATE' ? 'State Govt' : 'National Scheme'}
                      </Badge>
                      <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                        AY {sch.academicYear}
                      </span>
                    </div>
                    <Link href={`/scholarships/${sch.id}`} className="hover:underline">
                      <h3 className="text-base font-bold text-[#0F294A] leading-snug line-clamp-2">
                        {sch.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#475569] line-clamp-2">
                      {sch.description}
                    </p>
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Benefit</span>
                      <span className="text-sm font-bold text-[#0F294A]">{sch.financialAssistance}</span>
                    </div>
                    <Link href={`/scholarships/${sch.id}`}>
                      <Button variant="primary" size="sm">
                        Details ↗
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Official Government Portals Integrations */}
      <section className="w-full bg-[#F8FAFC] border-t border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-4">
            Direct Official Application Portals
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#475569]">
            <span className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] shadow-xs">
              National Scholarship Portal (NSP)
            </span>
            <span className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] shadow-xs">
              MahaDBT (Maharashtra)
            </span>
            <span className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] shadow-xs">
              SSP Karnataka Post-Matric
            </span>
            <span className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] shadow-xs">
              e-Medhabruti (Odisha)
            </span>
            <span className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] shadow-xs">
              Tata Trusts Foundation
            </span>
            <span className="px-3 py-1.5 rounded bg-white border border-[#E2E8F0] shadow-xs">
              AICTE Pragati Portal
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
