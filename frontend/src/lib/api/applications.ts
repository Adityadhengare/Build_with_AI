import { ApplicationRecord, ApplicationStatus } from '@/types/application';
import { MOCK_APPLICATIONS } from '@/lib/mock/applications';

export const applicationsApi = {
  async getApplications(): Promise<ApplicationRecord[]> {
    // Simulates TRD GET /api/applications
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...MOCK_APPLICATIONS];
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Promise<ApplicationRecord | null> {
    // Simulates TRD PUT /api/applications/:id/status
    await new Promise((resolve) => setTimeout(resolve, 150));
    const app = MOCK_APPLICATIONS.find((a) => a.id === id);
    if (!app) return null;
    app.status = status;
    if (notes !== undefined) app.notes = notes;
    app.lastUpdated = new Date().toISOString().split('T')[0];
    return { ...app };
  },

  async createApplication(record: Partial<ApplicationRecord>): Promise<ApplicationRecord> {
    // Simulates TRD POST /api/applications
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newRecord: ApplicationRecord = {
      id: `app-${Date.now()}`,
      scholarshipId: record.scholarshipId || 'sch-unknown',
      scholarshipTitle: record.scholarshipTitle || 'Scholarship Grant',
      providerName: record.providerName || 'Provider',
      providerType: record.providerType || 'Government',
      status: record.status || 'SAVED',
      deadline: record.deadline || '2026-11-30',
      estimatedAmount: record.estimatedAmount || '₹50,000 / year',
      officialPortalUrl: record.officialPortalUrl || 'https://scholarships.gov.in',
      notes: record.notes || '',
      lastUpdated: new Date().toISOString().split('T')[0],
      officialApplicationId: record.officialApplicationId,
      appliedDate: record.appliedDate,
    };
    return newRecord;
  }
};
