'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { EmptyState } from '@/components/ui/empty-state';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { Bookmark } from 'lucide-react';
import { scholarshipApi } from '@/lib/api/scholarships';
import { Scholarship } from '@/types/scholarship';

function SavedScholarshipsContent() {
  const router = useRouter();
  const [savedList, setSavedList] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      setIsLoading(true);
      const data = await scholarshipApi.getSavedScholarships();
      setSavedList(data);
      setIsLoading(false);
    }
    loadSaved();
  }, []);

  const handleRemove = (id: string) => {
    setSavedList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[#0F294A]" />
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">Saved Scholarships</h1>
        </div>
        <p className="text-xs md:text-sm text-[#475569]">
          Scholarships you bookmarked for later application and deadline monitoring.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedList.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8 text-[#94A3B8]" />}
          title="No saved scholarships yet"
          description="Browse the verified scholarship catalog and click the bookmark icon on any scheme to save it to your personal watchlist."
          actionLabel="Browse Verified Schemes"
          onAction={() => router.push('/scholarships')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedList.map((sch) => (
            <ScholarshipCard
              key={sch.id}
              scholarship={sch}
              isSaved={true}
              onSaveToggle={(id, saved) => {
                if (!saved) handleRemove(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SavedScholarshipsPage() {
  return (
    <ProtectedRoute>
      <SavedScholarshipsContent />
    </ProtectedRoute>
  );
}
