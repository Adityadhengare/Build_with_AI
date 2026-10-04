import { Scholarship } from '@/types/scholarship';

export const MOCK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'sch-mahadbt-ebc',
    title: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna',
    slug: 'mahadbt-ebc-reimbursement',
    provider: {
      name: 'Directorate of Higher & Technical Education, Maharashtra',
      type: 'GOVERNMENT_STATE',
      websiteUrl: 'https://mahadbt.maharashtra.gov.in',
      state: 'Maharashtra',
    },
    description: 'Fee concession and 50% tuition reimbursement scheme for bonafide students belonging to Economically Backward Class (EBC) and Other Backward Classes (OBC) pursuing higher professional technical degree education.',
    financialAssistance: '50% Tuition & Exam Fee Waiver',
    amountType: 'ANNUAL',
    estimatedAmountINR: 65000,
    applicationDeadline: '2026-10-31T23:59:59Z',
    applicationStartDate: '2026-08-01T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://mahadbt.maharashtra.gov.in',
    status: 'OPEN',
    isFeatured: true,
    matchScore: 94,
    matchStatus: 'ELIGIBLE',
    eligibilitySummary: 'Maharashtra Domicile • OBC/EBC • Family Income ≤ ₹8.0 Lakh • Minimum 50% in 12th/CET',
    tags: ['Government', 'State Govt', 'Post-Matric', 'Engineering', 'Maharashtra'],
    criteria: [
      {
        label: 'State Domicile',
        requirement: 'Must be a bonafide resident of Maharashtra',
        userValue: 'Maharashtra (Verified)',
        isMet: true,
        statusText: 'Verified via Domicile Certificate'
      },
      {
        label: 'Social Category',
        requirement: 'OBC, EBC, SEBC or Open General',
        userValue: 'OBC (Non-Creamy Layer)',
        isMet: true,
        statusText: 'Valid Caste Certificate Attached'
      },
      {
        label: 'Family Annual Income',
        requirement: 'Annual family income must not exceed ₹8,00,000',
        userValue: '₹2,35,000 / year',
        isMet: true,
        statusText: 'Well within ₹8.0L threshold'
      },
      {
        label: 'Academic Program',
        requirement: 'Admitted to AICTE approved UG degree (B.Tech / B.E / B.Arch)',
        userValue: 'B.Tech Computer Science (3rd Year)',
        isMet: true,
        statusText: 'Approved CAP admission verified'
      },
      {
        label: 'Minimum Academic Marks',
        requirement: 'Minimum 50% aggregate in 12th Board / Previous Year',
        userValue: '78.4% Aggregate',
        isMet: true,
        statusText: 'Exceeds 50% cutoff'
      }
    ],
    requiredDocuments: [
      { name: 'Income Certificate (FY 2026-27)', type: 'INCOME_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Caste Certificate / Validity', type: 'CASTE_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Domicile Certificate', type: 'DOMICILE_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' },
      { name: '12th Standard Marksheet', type: 'MARKSHEET_12TH', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Current College Bonafide Certificate', type: 'BONAFIDE_CERTIFICATE', mandatory: true, userStatus: 'UPLOADED' },
      { name: 'College Fee Receipt for AY 2026-27', type: 'OTHER', mandatory: false, userStatus: 'MISSING' }
    ]
  },
  {
    id: 'sch-nsp-central-sector',
    title: 'Central Sector Scheme of Scholarship for College and University Students (NSP)',
    slug: 'nsp-central-sector-scheme',
    provider: {
      name: 'Department of Higher Education, Ministry of Education, Govt of India',
      type: 'GOVERNMENT_CENTRAL',
      websiteUrl: 'https://scholarships.gov.in',
    },
    description: 'Central government merit-cum-means scholarship for regular students pursuing graduate and postgraduate studies in recognized colleges and universities across India.',
    financialAssistance: '₹12,000/yr for graduation, ₹20,000/yr for post-graduation',
    amountType: 'ANNUAL',
    estimatedAmountINR: 12000,
    applicationDeadline: '2026-11-15T23:59:59Z',
    applicationStartDate: '2026-08-15T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://scholarships.gov.in',
    status: 'OPEN',
    isFeatured: true,
    matchScore: 88,
    matchStatus: 'ELIGIBLE',
    eligibilitySummary: 'All India • >80th Percentile in 12th Board • Family Income ≤ ₹4.5 Lakh',
    tags: ['Central Govt', 'Merit-cum-Means', 'All India', 'NSP'],
    criteria: [
      {
        label: 'State Domicile',
        requirement: 'Citizen of India (Pan-India)',
        userValue: 'Indian Citizen (Maharashtra)',
        isMet: true
      },
      {
        label: '12th Board Percentile',
        requirement: 'Above 80th percentile in relevant State Board stream',
        userValue: '78.4% (82nd Percentile)',
        isMet: true
      },
      {
        label: 'Family Annual Income',
        requirement: 'Gross family annual income ≤ ₹4,50,000',
        userValue: '₹2,35,000 / year',
        isMet: true
      },
      {
        label: 'Mode of Education',
        requirement: 'Pursuing regular degree course (not correspondence)',
        userValue: 'Regular Full-time Student',
        isMet: true
      }
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card (Linked with Bank DBT)', type: 'AADHAAR_CARD', mandatory: true, userStatus: 'VERIFIED' },
      { name: '12th Marksheet', type: 'MARKSHEET_12TH', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Income Certificate', type: 'INCOME_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Bonafide Student Certificate', type: 'BONAFIDE_CERTIFICATE', mandatory: true, userStatus: 'UPLOADED' }
    ]
  },
  {
    id: 'sch-tata-trusts-engg',
    title: 'Tata Trusts Medical & Engineering Undergraduate Scholarship',
    slug: 'tata-trusts-medical-engineering',
    provider: {
      name: 'Tata Trusts Philanthropic Foundation',
      type: 'PRIVATE_TRUST',
      websiteUrl: 'https://www.tatatrusts.org',
    },
    description: 'Prestigious philanthropic grant reimbursing academic tuition fees for talented students pursuing professional Bachelor degrees in Engineering and Medicine who face financial constraints.',
    financialAssistance: 'Up to ₹50,000 per year against tuition receipts',
    amountType: 'ANNUAL',
    estimatedAmountINR: 50000,
    applicationDeadline: '2026-10-25T23:59:59Z',
    applicationStartDate: '2026-09-01T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://www.tatatrusts.org/our-work/individual-grants-programme/education-grants',
    status: 'OPEN',
    isFeatured: true,
    matchScore: 82,
    matchStatus: 'LIKELY_ELIGIBLE',
    eligibilitySummary: 'Undergraduate Engg/MBBS • Min 70% in previous year • Family Income ≤ ₹4.0 Lakh',
    tags: ['Private Trust', 'Engineering', 'Need-Based', 'Tata Trusts'],
    criteria: [
      {
        label: 'Course of Study',
        requirement: 'Undergraduate degree in Engineering (BE/B.Tech) or Medicine (MBBS)',
        userValue: 'B.Tech Computer Science',
        isMet: true
      },
      {
        label: 'Minimum Academic Marks',
        requirement: 'Minimum 70% or 7.5 CGPA in previous academic year',
        userValue: '78.4%',
        isMet: true
      },
      {
        label: 'Income Ceiling',
        requirement: 'Family income ≤ ₹4,00,000 per annum',
        userValue: '₹2,35,000',
        isMet: true
      },
      {
        label: 'Concurrent Scholarship Clause',
        requirement: 'Must declare all other state government reimbursements received',
        userValue: 'Pending Declaration',
        isMet: true,
        statusText: 'Needs verification during final trust interview'
      }
    ],
    requiredDocuments: [
      { name: 'Income Certificate from Tehsildar / SDO', type: 'INCOME_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Official Semester Marksheets', type: 'COLLEGE_MARKSHEET', mandatory: true, userStatus: 'UPLOADED' },
      { name: 'College Fee Structure & Receipts', type: 'OTHER', mandatory: true, userStatus: 'MISSING' },
      { name: 'Statement of Purpose / Family Need', type: 'OTHER', mandatory: false, userStatus: 'MISSING' }
    ]
  },
  {
    id: 'sch-hdfc-badhte-kadam',
    title: 'HDFC Bank Parivartan ECSS Scholarship for Undergraduates',
    slug: 'hdfc-parivartan-ecss',
    provider: {
      name: 'HDFC Bank Parivartan CSR Initiative',
      type: 'CORPORATE_CSR',
      websiteUrl: 'https://www.hdfcbank.com',
    },
    description: 'Corporate Social Responsibility grant for meritorious students from socio-economically weaker backgrounds to prevent educational dropouts in higher education.',
    financialAssistance: 'Fixed scholarship grant of ₹50,000 per year',
    amountType: 'ANNUAL',
    estimatedAmountINR: 50000,
    applicationDeadline: '2026-11-20T23:59:59Z',
    applicationStartDate: '2026-08-10T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://www.hdfcbank.com/personal/about-us/corporate-social-responsibility',
    status: 'OPEN',
    isFeatured: false,
    matchScore: 80,
    matchStatus: 'ELIGIBLE',
    eligibilitySummary: 'All India • Min 55% in previous exam • Annual family income ≤ ₹6.0 Lakh',
    tags: ['Corporate CSR', 'All India', 'Merit-cum-Means'],
    criteria: [
      {
        label: 'Current Academic Enrollment',
        requirement: 'Enrolled in any recognized UG program in India',
        userValue: 'B.Tech 3rd Year',
        isMet: true
      },
      {
        label: 'Academic Performance',
        requirement: 'Minimum 55% in previous qualifying examination',
        userValue: '78.4%',
        isMet: true
      },
      {
        label: 'Annual Family Income',
        requirement: 'Family annual income must not exceed ₹6,00,000',
        userValue: '₹2,35,000',
        isMet: true
      }
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', type: 'AADHAAR_CARD', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Latest Year Marksheet', type: 'MARKSHEET_12TH', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Valid Income Proof', type: 'INCOME_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'College ID Card / Bonafide', type: 'BONAFIDE_CERTIFICATE', mandatory: true, userStatus: 'UPLOADED' }
    ]
  },
  {
    id: 'sch-aicte-pragati',
    title: 'AICTE Pragati Scholarship Scheme for Girl Students',
    slug: 'aicte-pragati-scholarship-girls',
    provider: {
      name: 'All India Council for Technical Education (AICTE)',
      type: 'GOVERNMENT_CENTRAL',
      websiteUrl: 'https://www.aicte-india.org',
    },
    description: 'Empowering young women to pursue technical education by providing ₹50,000 per annum for tuition fees, computer purchase, and stationery expenses.',
    financialAssistance: '₹50,000 per annum for entire course duration',
    amountType: 'ANNUAL',
    estimatedAmountINR: 50000,
    applicationDeadline: '2026-11-30T23:59:59Z',
    applicationStartDate: '2026-09-01T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://scholarships.gov.in',
    status: 'OPEN',
    isFeatured: true,
    matchScore: 0,
    matchStatus: 'NOT_ELIGIBLE',
    eligibilitySummary: 'Female Candidates Only • AICTE Approved Degree/Diploma • Family Income ≤ ₹8.0 Lakh',
    tags: ['Central Govt', 'Girls in STEM', 'Technical Education', 'AICTE'],
    criteria: [
      {
        label: 'Gender Eligibility',
        requirement: 'Reserved exclusively for Female Candidates',
        userValue: 'Male (Aditya Patil)',
        isMet: false,
        statusText: 'Gender mismatch: Scheme is strictly for female students'
      },
      {
        label: 'Institution Approval',
        requirement: 'Must be enrolled in AICTE approved college',
        userValue: 'Government College of Engineering (AICTE Approved)',
        isMet: true
      },
      {
        label: 'Family Income',
        requirement: 'Family annual income ≤ ₹8,00,000',
        userValue: '₹2,35,000',
        isMet: true
      }
    ],
    requiredDocuments: [
      { name: '10th & 12th Marksheet', type: 'MARKSHEET_12TH', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Income Certificate', type: 'INCOME_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' }
    ]
  },
  {
    id: 'sch-reliance-foundation-ug',
    title: 'Reliance Foundation Undergraduate Scholarships',
    slug: 'reliance-foundation-undergraduate',
    provider: {
      name: 'Reliance Foundation',
      type: 'CORPORATE_CSR',
      websiteUrl: 'https://www.reliancefoundation.org',
    },
    description: 'Competitive merit-cum-means scholarship awarding up to ₹2,00,000 over degree duration for first-year undergraduate students in any stream across India.',
    financialAssistance: 'Up to ₹2,00,000 over course duration',
    amountType: 'COURSE_DURATION',
    estimatedAmountINR: 200000,
    applicationDeadline: '2026-10-15T23:59:59Z',
    applicationStartDate: '2026-08-01T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://www.scholarships.reliancefoundation.org',
    status: 'OPEN',
    isFeatured: false,
    matchScore: 65,
    matchStatus: 'NEEDS_VERIFICATION',
    eligibilitySummary: '1st Year Undergrad Only • Min 60% in 12th • Family Income ≤ ₹15.0 Lakh (preference to <₹2.5L)',
    tags: ['Corporate CSR', 'Undergraduate', 'Pan-India', 'Reliance'],
    criteria: [
      {
        label: 'Academic Year of Enrollment',
        requirement: 'Must be enrolled in 1st year of Bachelor degree in 2026',
        userValue: 'Currently in 3rd Year (B.Tech)',
        isMet: false,
        statusText: 'Candidate is in 3rd year; scheme specifies 1st year entrants'
      },
      {
        label: '12th Board Marks',
        requirement: 'Minimum 60% aggregate in 12th Standard',
        userValue: '78.4%',
        isMet: true
      },
      {
        label: 'Family Annual Income',
        requirement: 'Family income ≤ ₹15,00,000 (Priority to <₹2.5L)',
        userValue: '₹2,35,000',
        isMet: true
      }
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', type: 'AADHAAR_CARD', mandatory: true, userStatus: 'VERIFIED' },
      { name: 'Income Certificate', type: 'INCOME_CERTIFICATE', mandatory: true, userStatus: 'VERIFIED' }
    ]
  },
  {
    id: 'sch-karnataka-post-matric',
    title: 'Karnataka State Post-Matric Scholarship for Backward Classes (SSP)',
    slug: 'karnataka-ssp-post-matric',
    provider: {
      name: 'Department of Backward Classes Welfare, Govt of Karnataka',
      type: 'GOVERNMENT_STATE',
      websiteUrl: 'https://ssp.postmatric.karnataka.gov.in',
      state: 'Karnataka',
    },
    description: 'Post-matric tuition fee waiver and maintenance stipend for OBC and EWS students of Karnataka studying in recognized universities.',
    financialAssistance: 'Full Tuition Fee Concession + Monthly Stipend',
    amountType: 'ANNUAL',
    estimatedAmountINR: 35000,
    applicationDeadline: '2026-11-10T23:59:59Z',
    applicationStartDate: '2026-09-05T00:00:00Z',
    academicYear: '2026-27',
    officialPortalUrl: 'https://ssp.postmatric.karnataka.gov.in',
    status: 'OPEN',
    isFeatured: false,
    matchScore: 0,
    matchStatus: 'NOT_ELIGIBLE',
    eligibilitySummary: 'Karnataka Domicile Only • Category 1/2A/2B/3A/3B • Income ≤ ₹2.5 Lakh',
    tags: ['State Govt', 'Karnataka', 'SSP', 'Post-Matric'],
    criteria: [
      {
        label: 'State Domicile Requirement',
        requirement: 'Must be a permanent resident / domicile of Karnataka',
        userValue: 'Maharashtra Domicile',
        isMet: false,
        statusText: 'State restriction: Only Karnataka residents eligible'
      },
      {
        label: 'Family Income',
        requirement: 'Annual income ≤ ₹2,50,000',
        userValue: '₹2,35,000',
        isMet: true
      }
    ],
    requiredDocuments: [
      { name: 'Karnataka RD Number / Caste Certificate', type: 'CASTE_CERTIFICATE', mandatory: true, userStatus: 'MISSING' }
    ]
  }
];
