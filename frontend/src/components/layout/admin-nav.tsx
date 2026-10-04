'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BookOpen, Users, FileCheck, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Scholarships Manager', href: '/admin/scholarships', icon: BookOpen },
    { label: 'Students Directory', href: '/admin/students', icon: Users },
    { label: 'Application Oversight', href: '/admin/applications', icon: FileCheck },
  ];

  return (
    <div className="w-full bg-[#0F294A] text-white border-b border-[#00142F] py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#86EFAC]">
            <Shield className="w-4 h-4" />
            <span>ScholarSathi Admin Portal</span>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/dashboard"
          className="text-xs text-[#CBD5E1] hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Student App</span>
        </Link>
      </div>
    </div>
  );
}
