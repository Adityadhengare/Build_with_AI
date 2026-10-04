import { ApplicationRecord, ApplicationStatus } from '@/types/application';
import { apiClient } from './client';

export const applicationsApi = {
  async getApplications(): Promise<ApplicationRecord[]> {
    return await apiClient<ApplicationRecord[]>('/applications');
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Promise<ApplicationRecord> {
    return await apiClient<ApplicationRecord>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  async createApplication(record: Partial<ApplicationRecord>): Promise<ApplicationRecord> {
    return await apiClient<ApplicationRecord>('/applications', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
};
