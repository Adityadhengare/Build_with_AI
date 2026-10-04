'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OfficialBanner } from './official-banner';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Bell, Menu, X, ChevronDown, User, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');

  // Logged in vs public navigation
  const navItems = user
    ? [
        { label: 'Scholarships', href: '/scholarships' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Saved', href: '/saved' },
        { label: 'My Applications', href: '/applications' },
        { label: 'Documents', href: '/documents' },
        { label: 'AI Assistant', href: '/assistant' },
      ]
    : [
        { label: 'Scholarships', href: '/scholarships' },
      ];

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Student';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

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
              {user ? (
                <>
                  {/* Notification Bell */}
                  <Link
                    href="/notifications"
                    className="relative p-2 rounded text-[#475569] hover:text-[#0F294A] hover:bg-[#F1F5F9] transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </Link>

                  <div className="h-5 w-px bg-[#E2E8F0] hidden sm:block"></div>

                  {/* User Profile Mini Bar */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E5EEFF] border border-[#CBD5E1] text-[#0F294A] flex items-center justify-center font-bold text-xs">
                        {initials}
                      </div>
                      <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-bold text-[#0F294A] leading-tight truncate max-w-[120px]">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-[#64748B] leading-none">
                          {profile?.education?.courseName || 'Student'}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden md:block" />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md bg-white p-1.5 shadow-lg border border-[#E2E8F0] z-50 text-sm animate-in fade-in-0">
                        <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                          <p className="font-bold text-xs text-[#0F294A] truncate">{displayName}</p>
                          <p className="text-[11px] text-[#64748B] truncate">{displayEmail}</p>
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
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-2 pb-6 flex flex-col gap-1 shadow-md animate-in slide-in-from-top-2">
          {user && (
            <div className="px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-2">
              <span className="text-xs font-bold text-[#0F294A] block">{displayName}</span>
              <span className="text-[11px] text-[#64748B] block truncate">{displayEmail}</span>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded font-semibold text-sm',
                  isActive
                    ? 'bg-[#0F294A] text-white'
                    : 'text-[#334155] hover:bg-[#F1F5F9]'
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {!user && (
            <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2 mt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Register Account
                </Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-1 mt-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] rounded"
              >
                Student Profile
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] rounded cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
