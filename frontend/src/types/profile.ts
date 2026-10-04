import { CasteCategory, EducationLevel } from './scholarship';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER';
  domicileState: string;
  domicileDistrict: string;
  category: CasteCategory;
  religion: string;
  familyAnnualIncome: number;
  parentOccupation?: string;
  isDisabled: boolean;
  disabilityPercentage?: number;
  minorityStatus: boolean;
  profileCompleteness: number; // 0-100
  education: {
    currentLevel: EducationLevel;
    courseName: string;
    specialization: string;
    institutionName: string;
    institutionState: string;
    boardOrUniversity: string;
    currentYearOrSemester: number;
    passingYear: number;
    percentageOrCgpa: number;
    gradingScale: 'PERCENTAGE' | 'CGPA_10' | 'CGPA_4';
  };
}
