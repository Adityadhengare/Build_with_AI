import { Scholarship } from '@/types/scholarship';
import { MOCK_SCHOLARSHIPS } from '@/lib/mock/scholarships';

export interface ScholarshipFilters {
  query?: string;
  state?: string;
  category?: string;
  education?: string;
  providerType?: string;
  status?: string;
  sortBy?: 'match' | 'deadline' | 'amount';
}

export const scholarshipApi = {
  async getScholarships(filters?: ScholarshipFilters): Promise<Scholarship[]> {
    // Simulates TRD GET /api/scholarships
    await new Promise((resolve) => setTimeout(resolve, 150));
    let list = [...MOCK_SCHOLARSHIPS];

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.provider.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters?.state && filters.state !== 'ALL') {
      list = list.filter(
        (s) => s.provider.state === filters.state || s.tags.includes('All India') || !s.provider.state
      );
    }

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((s) => s.eligibilitySummary.includes(filters.category!) || s.tags.includes(filters.category!));
    }

    if (filters?.providerType && filters.providerType !== 'ALL') {
      list = list.filter((s) => s.provider.type === filters.providerType);
    }

    if (filters?.sortBy === 'deadline') {
      list.sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());
    } else if (filters?.sortBy === 'amount') {
      list.sort((a, b) => b.estimatedAmountINR - a.estimatedAmountINR);
    } else {
      // Default: best match score
      list.sort((a, b) => b.matchScore - a.matchScore);
    }

    return list;
  },

  async getScholarshipById(id: string): Promise<Scholarship | null> {
    // Simulates TRD GET /api/scholarships/:id
    await new Promise((resolve) => setTimeout(resolve, 100));
    const found = MOCK_SCHOLARSHIPS.find((s) => s.id === id || s.slug === id);
    return found || null;
  },

  async getSavedScholarships(): Promise<Scholarship[]> {
    // Simulates TRD GET /api/scholarships/saved
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_SCHOLARSHIPS.slice(0, 3);
  },

  async toggleSaveScholarship(id: string, save: boolean): Promise<boolean> {
    // Simulates TRD POST/DELETE /api/scholarships/:id/save
    await new Promise((resolve) => setTimeout(resolve, 100));
    return save;
  }
};
