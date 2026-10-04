'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('nodal.officer@scholarsathi.gov.in');
  const [password, setPassword] = useState('AdminPass2026!');
  const [totp, setTotp] = useState('482910');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#0F294A] text-white flex items-center justify-center mb-3 shadow-xs">
            <Shield className="w-6 h-6 text-[#86EFAC]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F294A]">Administrative Gateway</h2>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded mt-2">
            Restricted Officer Access
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Government / Officer Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Officer Security Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="2FA / TOTP Security Token (6-Digits)"
            type="text"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            placeholder="123456"
            helperText="Time-based one-time authentication code from your authenticator app."
            required
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Authenticate into Console
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          Looking for student login?{' '}
          <Link href="/login" className="font-bold text-[#0F294A] hover:underline">
            Go to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
