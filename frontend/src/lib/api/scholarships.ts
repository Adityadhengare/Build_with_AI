import { Scholarship } from '@/types/scholarship';
import { apiClient } from './client';

export interface ScholarshipFilters {
  query?: string;
  state?: string;
  category?: string;
  education?: string;
  providerType?: string;
  status?: string;
  sortBy?: 'match' | 'deadline' | 'amount';
  minAmount?: number;
}

export const scholarshipApi = {
  async getScholarships(filters?: ScholarshipFilters): Promise<Scholarship[]> {
    const params = new URLSearchParams();
    if (filters?.query) params.set('search', filters.query);
    if (filters?.state && filters.state !== 'ALL') params.set('state', filters.state);
    if (filters?.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters?.education && filters.education !== 'ALL') params.set('educationLevel', filters.education);
    if (filters?.providerType && filters.providerType !== 'ALL') params.set('providerType', filters.providerType);
    if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);

    const queryString = params.toString();
    const endpoint = queryString ? `/scholarships?${queryString}` : '/scholarships';
    return await apiClient<Scholarship[]>(endpoint);
  },

  async getScholarshipById(id: string): Promise<Scholarship> {
    return await apiClient<Scholarship>(`/scholarships/${id}`);
  },

  async getSavedScholarships(): Promise<Scholarship[]> {
    return await apiClient<Scholarship[]>('/scholarships/saved');
  },

  async toggleSaveScholarship(id: string, save: boolean): Promise<boolean> {
    if (save) {
      await apiClient(`/scholarships/${id}/save`, { method: 'POST' });
    } else {
      await apiClient(`/scholarships/${id}/save`, { method: 'DELETE' });
    }
    return save;
  },
};
