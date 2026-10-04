import { StudentDocument } from '@/types/document';

export const MOCK_DOCUMENTS: StudentDocument[] = [
  {
    id: 'doc-001',
    documentType: 'INCOME_CERTIFICATE',
    title: 'Tahsil Office Family Income Certificate',
    fileName: 'Income_Certificate_FY26_27.pdf',
    fileSizeBytes: 1420000,
    uploadedAt: '2026-09-12T10:30:00Z',
    status: 'VERIFIED',
    authorityBadge: 'Tahsil Office Haveli, Pune Verified',
    extraction: {
      annualIncome: 235000,
      financialYear: '2026-27',
      state: 'Maharashtra',
      certificateNumber: 'MH-REV-INC-2026-48912',
      issuingAuthority: 'Sub-Divisional Magistrate / Tehsildar',
      confidenceScore: 0.98,
    }
  },
  {
    id: 'doc-002',
    documentType: 'CASTE_CERTIFICATE',
    title: 'OBC Caste & Non-Creamy Layer Certificate',
    fileName: 'OBC_NCL_Certificate_2026.pdf',
    fileSizeBytes: 1850000,
    uploadedAt: '2026-09-12T10:32:00Z',
    status: 'VERIFIED',
    authorityBadge: 'Government of Maharashtra Caste Scrutiny Committee',
    extraction: {
      casteCategory: 'OBC',
      certificateNumber: 'CC-OBC-MH-918234-A',
      studentName: 'Aditya Patil',
      confidenceScore: 0.96,
    }
  },
  {
    id: 'doc-003',
    documentType: 'DOMICILE_CERTIFICATE',
    title: 'Certificate of Age, Nationality and Domicile',
    fileName: 'Domicile_Certificate_Maharashtra.pdf',
    fileSizeBytes: 980000,
    uploadedAt: '2026-09-12T10:35:00Z',
    status: 'VERIFIED',
    authorityBadge: 'Executive Magistrate, Pune',
    extraction: {
      state: 'Maharashtra',
      certificateNumber: 'DOM-2022-77190',
      confidenceScore: 0.99,
    }
  },
  {
    id: 'doc-004',
    documentType: 'MARKSHEET_12TH',
    title: 'HSC Standard 12th Board Examination Marksheet',
    fileName: 'HSC_Board_12th_Marksheet.pdf',
    fileSizeBytes: 2100000,
    uploadedAt: '2026-09-14T14:15:00Z',
    status: 'VERIFIED',
    authorityBadge: 'Maharashtra State Board of Secondary and Higher Secondary Education',
    extraction: {
      percentage: 78.4,
      studentName: 'Aditya Patil',
      confidenceScore: 0.97,
    }
  },
  {
    id: 'doc-005',
    documentType: 'BONAFIDE_CERTIFICATE',
    title: 'College Bonafide & Enrolment Certificate',
    fileName: 'COEP_Bonafide_AY26_27.pdf',
    fileSizeBytes: 650000,
    uploadedAt: '2026-10-01T09:00:00Z',
    status: 'NEEDS_REVIEW',
    authorityBadge: 'COEP Technological University Seal Detected',
    extraction: {
      studentName: 'Aditya Patil',
      confidenceScore: 0.74,
    }
  }
];
