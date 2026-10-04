'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/logo';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('aditya.patil@engg.edu.in');
  const [password, setPassword] = useState('SecurePass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setIsLoading(true);
    // Simulate login API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,41,74,0.06)]">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo subtitle={false} />
          <h2 className="text-xl font-bold text-[#0F294A] mt-4">
            Student Portal Sign In
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Access your scholarship matches, document vault, and tracked applications.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@institution.ac.in"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-[#94A3B8] hover:text-[#475569]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-[#CBD5E1] text-[#0F294A]" />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-semibold text-[#1D4ED8] hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Sign In to Dashboard
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E2E8F0]"></div>
          <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Or continue with</span>
          <div className="h-px flex-1 bg-[#E2E8F0]"></div>
        </div>

        {/* Google SSO */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="outline"
          size="md"
          className="w-full flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-xs font-semibold text-[#0F294A]">Sign In with Google</span>
        </Button>

        <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          New to ScholarSathi?{' '}
          <Link href="/register" className="font-bold text-[#0F294A] hover:underline">
            Create a student account
          </Link>
        </div>
      </div>
    </div>
  );
}
