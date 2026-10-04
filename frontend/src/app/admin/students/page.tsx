'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/layout/admin-nav';
import { Search, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { StudentProfile } from '@/types/profile';
import { formatINR } from '@/lib/utils';

export default function AdminStudentsPage() {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      setIsLoading(true);
      try {
        const data = await adminApi.getStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      s.email?.toLowerCase().includes(query.toLowerCase()) ||
      s.education?.institutionName?.toLowerCase().includes(query.toLowerCase()) ||
      s.category?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">Student Profiles Directory</h1>
          <p className="text-xs md:text-sm text-[#475569] mt-0.5">
            Audit student profile declarations, income tiers, and document verification completeness.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name, college, email, or category..."
            className="h-10 w-full pl-10 pr-4 rounded-lg border border-[#CBD5E1] bg-white text-xs md:text-sm text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center">
            <Users className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#0F294A]">No student profiles registered yet</h3>
            <p className="text-xs text-[#64748B] mt-1">
              When new students register and fill onboarding details, their records will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2E8F0] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Student Name &amp; Email</th>
                    <th className="py-3 px-4">Institution &amp; Degree</th>
                    <th className="py-3 px-4">Domicile State</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Annual Income</th>
                    <th className="py-3 px-4 text-right">Profile Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.map((s) => (
                    <tr key={s.id || s.email} className="hover:bg-[#F8F9FF] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0F294A] block">{s.fullName}</span>
                        <span className="text-[11px] text-[#64748B]">{s.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#0F294A] block">
                          {s.education?.courseName || 'Course Not Specified'}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {s.education?.institutionName || 'Institution Not Specified'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#475569]">{s.domicileState || 'Not Specified'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#EFF4FF] text-[#1E3A8A] border border-[#BFDBFE]">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0F294A]">
                        {formatINR(s.familyAnnualIncome || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(s.profileCompleteness && s.profileCompleteness >= 70) ? (
                          <span className="text-xs font-bold text-[#15803D] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#B45309] flex items-center justify-end gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
