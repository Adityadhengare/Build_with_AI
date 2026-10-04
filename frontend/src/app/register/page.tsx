'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/logo';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters with letters and numbers.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    // Simulate registration API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to multi-step onboarding as required
      router.push('/onboarding');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,41,74,0.06)]">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo subtitle={false} />
          <h2 className="text-xl font-bold text-[#0F294A] mt-4">
            Create Your Student Account
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm">
            Join thousands of Indian students discovering legitimate scholarships and fee waivers.
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
            label="Full Name (as per Aadhaar / Marksheet)"
            name="fullName"
            type="text"
            placeholder="e.g. Ramesh Balasaheb Patil"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="student@college.edu.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Mobile Number (for OTP & alerts)"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Create Password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-[#475569] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-0.5 rounded border-[#CBD5E1] text-[#0F294A]"
              />
              <span>
                I agree to the Terms of Service and consent to deterministic processing of my educational data under DPDPA 2023.
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={isLoading}>
            Create Account &amp; Setup Profile
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#0F294A] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
