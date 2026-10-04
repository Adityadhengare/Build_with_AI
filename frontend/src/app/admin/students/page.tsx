'use client';

import React, { useState } from 'react';
import { AdminNav } from '@/components/layout/admin-nav';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminStudentsPage() {
  const [query, setQuery] = useState('');

  const mockStudents = [
    {
      id: 'usr-1',
      name: 'Aditya Patil',
      email: 'aditya.patil@engg.edu.in',
      course: 'B.Tech Computer Science (3rd Yr)',
      college: 'COEP Pune',
      state: 'Maharashtra',
      category: 'OBC',
      income: '₹2,35,000',
      status: 'VERIFIED',
      completeness: '88%',
    },
    {
      id: 'usr-2',
      name: 'Priya Sharma',
      email: 'priya.sharma@du.ac.in',
      course: 'B.Sc Physics (2nd Yr)',
      college: 'Miranda House, Delhi',
      state: 'Uttar Pradesh',
      category: 'EWS',
      income: '₹1,80,000',
      status: 'VERIFIED',
      completeness: '92%',
    },
    {
      id: 'usr-3',
      name: 'Rahul K. Naik',
      email: 'rahul.naik@rvce.edu.in',
      course: 'B.E Electronics (1st Yr)',
      college: 'RVCE Bangalore',
      state: 'Karnataka',
      category: 'SC',
      income: '₹1,20,000',
      status: 'NEEDS_REVIEW',
      completeness: '75%',
    },
    {
      id: 'usr-4',
      name: 'Sneha Mondal',
      email: 'sneha.m@ju.edu.in',
      course: 'M.Sc Chemistry (1st Yr)',
      college: 'Jadavpur University',
      state: 'West Bengal',
      category: 'GENERAL',
      income: '₹4,50,000',
      status: 'VERIFIED',
      completeness: '82%',
    },
  ];

  const filtered = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.college.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
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
            placeholder="Search students by name, college, or category..."
            className="h-10 w-full pl-10 pr-4 rounded-lg border border-[#CBD5E1] bg-white text-xs md:text-sm text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
          />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2E8F0] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Student Name &amp; Email</th>
                  <th className="py-3 px-4">Institution &amp; Degree</th>
                  <th className="py-3 px-4">Domicile State</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Family Income</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8F9FF] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F294A] block">{s.name}</span>
                      <span className="text-[11px] text-[#64748B]">{s.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#0F294A] block">{s.course}</span>
                      <span className="text-[11px] text-[#64748B]">{s.college}</span>
                    </td>
                    <td className="py-3 px-4 text-[#475569]">{s.state}</td>
                    <td className="py-3 px-4 font-bold text-[#0F294A]">{s.category}</td>
                    <td className="py-3 px-4 font-semibold text-[#15803D]">{s.income}</td>
                    <td className="py-3 px-4">
                      {s.status === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-bold text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold text-[10px] flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Audit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
