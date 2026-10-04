'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OfficialBanner } from './official-banner';
import { Logo } from './logo';
import { Bell, Menu, X, ChevronDown, User, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // If in admin route, render minimal or delegate
  const isAdmin = pathname.startsWith('/admin');

  const navItems = [
    { label: 'Scholarships', href: '/scholarships' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Saved', href: '/saved' },
    { label: 'My Applications', href: '/applications' },
    { label: 'Documents', href: '/documents' },
    { label: 'AI Assistant', href: '/assistant' },
  ];

  return (
    <header className="fixed top-0 w-full z-40 bg-white border-b border-[#E2E8F0] shadow-[0_1px_2px_0_rgba(15,41,74,0.05)]">
      <OfficialBanner />
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <Logo />

        {/* Desktop Navigation */}
        {!isAdmin && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-[#D5E3FD] text-[#0D1C2F]'
                      : 'text-[#475569] hover:text-[#0F294A] hover:bg-[#F1F5F9]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {!isAdmin && (
            <>
              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2 rounded text-[#475569] hover:text-[#0F294A] hover:bg-[#F1F5F9] transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B91C1C] rounded-full ring-2 ring-white"></span>
              </Link>

              <div className="h-5 w-px bg-[#E2E8F0] hidden sm:block"></div>

              {/* User Profile Mini Bar */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E5EEFF] border border-[#CBD5E1] text-[#0F294A] flex items-center justify-center font-bold text-xs">
                    AP
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#0F294A] leading-tight">Aditya Patil</span>
                    <span className="text-[10px] text-[#64748B] leading-none">B.Tech, 3rd Year</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-white p-1.5 shadow-lg border border-[#E2E8F0] z-50 text-sm animate-in fade-in-0">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                      <p className="font-bold text-xs text-[#0F294A]">Aditya Patil</p>
                      <p className="text-[11px] text-[#64748B] truncate">aditya.patil@engg.edu.in</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F294A]"
                    >
                      <User className="w-4 h-4 text-[#64748B]" />
                      My Student Profile
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F294A]"
                    >
                      <Shield className="w-4 h-4 text-[#64748B]" />
                      Admin Console
                    </Link>
                    <div className="my-1 border-t border-[#E2E8F0]"></div>
                    <Link
                      href="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2]"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded text-[#475569] hover:text-[#0F294A] hover:bg-[#F1F5F9]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1 shadow-md">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block px-3 py-2 rounded text-sm font-semibold transition-colors',
                pathname === item.href ? 'bg-[#D5E3FD] text-[#0D1C2F]' : 'text-[#334155] hover:bg-[#F1F5F9]'
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#E2E8F0] mt-2 flex flex-col gap-1">
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#475569] flex items-center gap-2 hover:bg-[#F1F5F9]"
            >
              <User className="w-4 h-4" /> My Profile
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#475569] flex items-center gap-2 hover:bg-[#F1F5F9]"
            >
              <Shield className="w-4 h-4" /> Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
