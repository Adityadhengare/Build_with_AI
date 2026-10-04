import { StudentProfile } from '@/types/profile';
import { MOCK_STUDENT_PROFILE } from '@/lib/mock/student-profile';

export const profileApi = {
  async getProfile(): Promise<StudentProfile> {
    // Simulates TRD GET /api/profile
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...MOCK_STUDENT_PROFILE };
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    // Simulates TRD PUT /api/profile
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...MOCK_STUDENT_PROFILE, ...updates };
  },

  async recalculateMatches(): Promise<{ count: number; highlyEligible: number }> {
    // Simulates TRD POST /api/profile/recalculate-matches
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { count: 24, highlyEligible: 8 };
  }
};
