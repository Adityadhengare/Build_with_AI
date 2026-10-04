import { Scholarship } from '@/types/scholarship';
import { MOCK_SCHOLARSHIPS } from '@/lib/mock/scholarships';

export interface AdminStats {
  totalStudents: number;
  activeScholarships: number;
  totalFundsCatalogedINR: string;
  pendingVerifications: number;
  activeApplicationsCount: number;
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    // Simulates TRD GET /api/admin/metrics
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      totalStudents: 24510,
      activeScholarships: 852,
      totalFundsCatalogedINR: '₹140+ Crores',
      pendingVerifications: 14,
      activeApplicationsCount: 6840,
    };
  },

  async getAllScholarships(): Promise<Scholarship[]> {
    // Simulates TRD GET /api/admin/scholarships
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...MOCK_SCHOLARSHIPS];
  },

  async createScholarship(data: Partial<Scholarship>): Promise<Scholarship> {
    // Simulates TRD POST /api/admin/scholarships
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newSch: Scholarship = {
      id: `sch-${Date.now()}`,
      title: data.title || 'New Scheme',
      slug: (data.title || 'new-scheme').toLowerCase().replace(/\s+/g, '-'),
      provider: data.provider || {
        name: 'Government Department',
        type: 'GOVERNMENT_STATE',
        websiteUrl: 'https://scholarships.gov.in',
      },
      description: data.description || 'Scholarship description',
      financialAssistance: data.financialAssistance || '₹25,000 / year',
      amountType: 'ANNUAL',
      estimatedAmountINR: 25000,
      applicationDeadline: data.applicationDeadline || '2026-11-30T23:59:59Z',
      applicationStartDate: '2026-08-01T00:00:00Z',
      academicYear: '2026-27',
      officialPortalUrl: data.officialPortalUrl || 'https://scholarships.gov.in',
      status: 'OPEN',
      matchScore: 85,
      matchStatus: 'ELIGIBLE',
      eligibilitySummary: data.eligibilitySummary || 'Eligibility details',
      criteria: data.criteria || [],
      requiredDocuments: data.requiredDocuments || [],
      tags: data.tags || ['Government', 'Merit-cum-Means'],
    };
    MOCK_SCHOLARSHIPS.unshift(newSch);
    return newSch;
  },

  async updateScholarship(id: string, updates: Partial<Scholarship>): Promise<Scholarship | null> {
    // Simulates TRD PUT /api/admin/scholarships/:id
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = MOCK_SCHOLARSHIPS.findIndex((s) => s.id === id);
    if (index === -1) return null;
    MOCK_SCHOLARSHIPS[index] = { ...MOCK_SCHOLARSHIPS[index], ...updates };
    return MOCK_SCHOLARSHIPS[index];
  },

  async deleteScholarship(id: string): Promise<boolean> {
    // Simulates TRD DELETE /api/admin/scholarships/:id
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = MOCK_SCHOLARSHIPS.findIndex((s) => s.id === id);
    if (index !== -1) {
      MOCK_SCHOLARSHIPS.splice(index, 1);
    }
    return true;
  }
};
