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

export interface EligibilityCriterion {
  label: string;
  requirement: string;
  userValue: string;
  isMet: boolean;
  statusText?: string;
}

export interface RequiredDocument {
  name: string;
  type: string;
  mandatory: boolean;
  userStatus: 'VERIFIED' | 'UPLOADED' | 'MISSING' | 'RENEWAL_NEEDED';
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
  };
  description: string;
  financialAssistance: string;
  amountType: 'ANNUAL' | 'ONE_TIME' | 'MONTHLY' | 'COURSE_DURATION';
  estimatedAmountINR: number;
  applicationDeadline: string;
  applicationStartDate: string;
  academicYear: string;
  officialPortalUrl: string;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED';
  isFeatured?: boolean;
  matchScore: number; // percentage (e.g. 94)
  matchStatus: MatchStatus;
  eligibilitySummary: string;
  criteria: EligibilityCriterion[];
  requiredDocuments: RequiredDocument[];
  tags: string[];
}
