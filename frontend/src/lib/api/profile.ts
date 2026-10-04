import { StudentProfile } from '@/types/profile';
import { apiClient } from './client';

export const profileApi = {
  async getProfile(): Promise<StudentProfile> {
    return await apiClient<StudentProfile>('/profile');
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    // If updates contain education, send academic update
    if (updates.education) {
      await apiClient('/profile/academic', {
        method: 'PUT',
        body: JSON.stringify({
          currentEducationLevel: updates.education.currentLevel,
          courseName: updates.education.courseName,
          specialization: updates.education.specialization,
          institutionName: updates.education.institutionName,
          percentageOrCgpa: updates.education.percentageOrCgpa,
          yearOfStudy: updates.education.currentYearOrSemester,
        }),
      });
    }

    // Update personal/category/income details
    return await apiClient<StudentProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async recalculateMatches(): Promise<{ count: number; highlyEligible: number }> {
    return await apiClient<{ count: number; highlyEligible: number }>('/profile/recalculate-matches', {
      method: 'POST',
    });
  },
};
