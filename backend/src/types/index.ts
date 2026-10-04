export type UserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

export type ProviderType = 
  | 'GOVERNMENT_CENTRAL' 
  | 'GOVERNMENT_STATE' 
  | 'PRIVATE_TRUST' 
  | 'CORPORATE_CSR' 
  | 'NGO';

export type CasteCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';

export type EducationLevel = 
  | 'CLASS_10' 
  | 'CLASS_12' 
  | 'DIPLOMA' 
  | 'UNDERGRADUATE' 
  | 'POSTGRADUATE' 
  | 'DOCTORATE';

export type MatchStatus = 'ELIGIBLE' | 'LIKELY_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'NOT_ELIGIBLE';

export type DocumentType =
  | 'INCOME_CERTIFICATE'
  | 'CASTE_CERTIFICATE'
  | 'DOMICILE_CERTIFICATE'
  | 'MARKSHEET_10TH'
  | 'MARKSHEET_12TH'
  | 'COLLEGE_MARKSHEET'
  | 'AADHAAR_CARD'
  | 'DISABILITY_CERTIFICATE'
  | 'BONAFIDE_CERTIFICATE'
  | 'FEE_RECEIPT'
  | 'OTHER';

export type DocumentStatus = 'PROCESSING' | 'EXTRACTED' | 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';

export type ApplicationStatus =
  | 'SAVED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SELECTED'
  | 'REJECTED';

export type NotificationType =
  | 'DEADLINE_ALERT'
  | 'DOCUMENT_ALERT'
  | 'NEW_MATCH'
  | 'APPLICATION_UPDATE'
  | 'SYSTEM';

export interface EducationProfile {
  currentEducationLevel: EducationLevel;
  courseName: string;
  specialization?: string;
  institutionName: string;
  institutionState: string;
  boardOrUniversity: string;
  currentYearOrSemester: number;
  passingYear: number;
  percentageOrCgpa: number;
  gradingScale: 'PERCENTAGE' | 'CGPA_10' | 'CGPA_4';
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER';
  domicileState: string;
  domicileDistrict: string;
  category: CasteCategory;
  religion?: string;
  familyAnnualIncome: number;
  parentOccupation?: string;
  isDisabled: boolean;
  disabilityPercentage?: number;
  minorityStatus: boolean;
  profileCompleteness: number; // 0 to 100
  education?: EducationProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipDocumentReq {
  name: string;
  type: DocumentType;
  mandatory: boolean;
  description?: string;
}

export interface ScholarshipEligibilityRules {
  maxFamilyIncome: number | null;
  minPercentage: number | null;
  allowedCategories: string[];
  allowedStates: string[];
  allowedGenders: string[];
  allowedEducationLevels: string[];
  allowedCourses: string[];
  requiresDisability: boolean;
  minDisabilityPercentage?: number | null;
  requiresMinority: boolean;
  isIncomeStrict: boolean;
  mandatoryDocuments?: DocumentType[];
}

export interface Scholarship {
  id: string;
  title: string;
  slug: string;
  provider: {
    name: string;
    type: ProviderType;
    websiteUrl: string;
    state?: string;
    contactEmail?: string;
  };
  description: string;
  financialAssistance: string;
  amountType: 'ANNUAL' | 'ONE_TIME' | 'MONTHLY' | 'COURSE_DURATION';
  estimatedAmountINR: number;
  applicationDeadline: string;
  applicationStartDate: string;
  academicYear: string;
  officialPortalUrl: string;
  sourceUrl?: string;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED' | 'DRAFT' | 'ARCHIVED';
  isFeatured?: boolean;
  eligibilitySummary: string;
  eligibilityRules: ScholarshipEligibilityRules;
  requiredDocuments: ScholarshipDocumentReq[];
  tags: string[];
  lastVerified: string;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityCheckItem {
  rule: string;
  required: string | number | boolean | string[];
  actual: string | number | boolean | undefined;
  passed: boolean;
  message?: string;
}

export interface RuleEvaluationResult {
  scholarshipId: string;
  status: MatchStatus;
  matchScore: number;
  checks: EligibilityCheckItem[];
  matchReasons: string[];
  mismatchReasons: string[];
  missingDocuments: string[];
  explanation: string;
}

export interface DocumentExtractionResult {
  documentType: DocumentType | 'UNKNOWN';
  extractedStudentName?: string | null;
  issuingState?: string | null;
  issuingAuthority?: string | null;
  certificateNumber?: string | null;
  annualIncome?: number | null;
  financialYear?: string | null;
  casteCategory?: CasteCategory | 'OTHER' | null;
  percentage?: number | null;
  confidenceScore: number;
  isDocumentLegible: boolean;
  notesOrAnomalies?: string | null;
}

export interface StudentDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  status: DocumentStatus;
  uploadedAt: string;
  updatedAt: string;
  extraction?: DocumentExtractionResult;
  authorityBadge?: string;
  downloadUrl?: string;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  scholarshipId: string;
  scholarshipTitle: string;
  providerName: string;
  providerType: string;
  status: ApplicationStatus;
  officialApplicationId?: string;
  appliedDate?: string;
  deadline: string;
  estimatedAmount: string;
  officialPortalUrl: string;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface SavedScholarship {
  scholarshipId: string;
  userId: string;
  savedAt: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: UserRole;
  isVerified?: boolean;
}
