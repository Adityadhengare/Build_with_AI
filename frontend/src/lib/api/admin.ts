import { Scholarship } from '@/types/scholarship';
import { apiClient } from './client';

export interface AdminStats {
  totalStudents: number;
  activeScholarships: number;
  totalFundsCatalogedINR: string;
  pendingVerifications: number;
  activeApplicationsCount: number;
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    return await apiClient<AdminStats>('/admin/metrics');
  },

  async getAllScholarships(): Promise<Scholarship[]> {
    return await apiClient<Scholarship[]>('/admin/scholarships');
  },

  async createScholarship(data: Partial<Scholarship>): Promise<Scholarship> {
    return await apiClient<Scholarship>('/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateScholarship(id: string, updates: Partial<Scholarship>): Promise<Scholarship> {
    return await apiClient<Scholarship>(`/admin/scholarships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteScholarship(id: string): Promise<boolean> {
    await apiClient(`/admin/scholarships/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  async getStudents(): Promise<any[]> {
    return await apiClient<any[]>('/admin/students');
  },

  async getApplications(): Promise<any[]> {
    return await apiClient<any[]>('/admin/applications');
  },
};
