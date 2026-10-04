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
  | 'OTHER';

export type DocumentStatus = 'PROCESSING' | 'EXTRACTED' | 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';

export interface DocumentExtractionData {
  annualIncome?: number;
  financialYear?: string;
  casteCategory?: string;
  state?: string;
  percentage?: number;
  studentName?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  confidenceScore: number;
}

export interface StudentDocument {
  id: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  extraction?: DocumentExtractionData;
  authorityBadge?: string;
}
