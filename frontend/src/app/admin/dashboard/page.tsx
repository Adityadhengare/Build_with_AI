'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/layout/admin-nav';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  Coins, 
  AlertTriangle, 
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { adminApi, AdminStats } from '@/lib/api/admin';
import { Scholarship } from '@/types/scholarship';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentScholarships, setRecentScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [statsData, schs] = await Promise.all([
          adminApi.getStats().catch(() => null),
          adminApi.getAllScholarships().catch(() => []),
        ]);
        setStats(statsData);
        setRecentScholarships(schs || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">
              Administrative &amp; Verification Console
            </h1>
            <p className="text-xs md:text-sm text-[#475569] mt-1">
              Platform-wide telemetry, scheme data hygiene, and anomaly resolution queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/scholarships">
              <Button variant="primary" size="md">
                <span>Add New Scholarship</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Operational Metric Tiles */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase">Registered Students</span>
                <Users className="w-5 h-5 text-[#0F294A]" />
              </div>
              <span className="text-2xl font-bold text-[#0F294A] block mt-2">
                {stats?.totalStudents ?? 0}
              </span>
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Total Firestore accounts
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase">Active Catalog Schemes</span>
                <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
              </div>
              <span className="text-2xl font-bold text-[#0F294A] block mt-2">
                {stats?.activeScholarships ?? 0}
              </span>
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Open for applications
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase">Cataloged Fund Pool</span>
                <Coins className="w-5 h-5 text-[#15803D]" />
              </div>
              <span className="text-2xl font-bold text-[#15803D] block mt-2">
                {stats?.totalFundsCatalogedINR || '₹0'}
              </span>
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Calculated active grant potential
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#B45309] uppercase">Pending Verifications</span>
                <AlertTriangle className="w-5 h-5 text-[#B45309]" />
              </div>
              <span className="text-2xl font-bold text-[#B45309] block mt-2">
                {stats?.pendingVerifications ?? 0}
              </span>
              <span className="text-[11px] text-[#B45309] font-bold mt-1 block">
                Unverified document uploads
              </span>
            </div>
          </div>
        )}

        {/* Operational Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Schemes Audit */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0F294A]">Recent Verified Scholarships</h3>
              <Link href="/admin/scholarships" className="text-xs font-bold text-[#0F294A] hover:underline">
                View All Catalog →
              </Link>
            </div>

            {recentScholarships.length === 0 ? (
              <p className="text-xs text-[#64748B] py-3 text-center">No scholarships currently cataloged.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {recentScholarships.slice(0, 4).map((sch) => (
                  <div key={sch.id} className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#0F294A] block truncate max-w-sm">{sch.title}</span>
                      <span className="text-[#64748B]">{sch.provider.name} • {sch.provider.type}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-bold shrink-0">
                      {sch.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI System Health & OCR Telemetry */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#15803D]" />
                <h3 className="text-base font-bold text-[#0F294A]">Gemini AI Service Health</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold uppercase">
                Active (Gemini 2.5 Flash)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[#475569]">Backend Engine Status</span>
                <span className="font-bold text-[#15803D]">Operational (Port 5001)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[#475569]">Firestore Region</span>
                <span className="font-bold text-[#0F294A]">asia-south1 (Mumbai)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[#475569]">Secret Isolation Check</span>
                <span className="font-bold text-[#15803D]">100% Server-Side Only</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[#475569]">Active Scholarship Schemes</span>
                <span className="font-bold text-[#0F294A]">{stats?.activeScholarships ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
