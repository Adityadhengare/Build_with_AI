import { describe, it, expect, beforeEach } from 'vitest';
import { EligibilityService } from '../src/services/eligibilityService';
import { StudentProfile, Scholarship, StudentDocument } from '../src/types';

describe('Deterministic Eligibility Engine', () => {
  let eligibilityService: EligibilityService;
  let baseStudent: StudentProfile;
  let baseScholarship: Scholarship;
  let verifiedDocs: StudentDocument[];

  beforeEach(() => {
    eligibilityService = new EligibilityService();

    baseStudent = {
      id: 'sp_1',
      userId: 'user_1',
      fullName: 'Ramesh Patil',
      email: 'ramesh@example.com',
      dob: '2005-05-15',
      gender: 'MALE',
      domicileState: 'Maharashtra',
      domicileDistrict: 'Pune',
      category: 'OBC',
      familyAnnualIncome: 200000,
      isDisabled: false,
      minorityStatus: false,
      profileCompleteness: 90,
      education: {
        currentEducationLevel: 'UNDERGRADUATE',
        courseName: 'B.Tech',
        institutionName: 'COEP Pune',
        institutionState: 'Maharashtra',
        boardOrUniversity: 'SPPU',
        currentYearOrSemester: 2,
        passingYear: 2027,
        percentageOrCgpa: 75.0,
        gradingScale: 'PERCENTAGE',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    baseScholarship = {
      id: 'sch_test',
      title: 'State OBC Merit Scholarship',
      slug: 'state-obc-merit',
      provider: {
        name: 'Govt of Maharashtra',
        type: 'GOVERNMENT_STATE',
        websiteUrl: 'https://mahadbt.gov.in',
        state: 'Maharashtra',
      },
      description: 'Scholarship for meritorious OBC students',
      financialAssistance: '₹50,000 / year',
      amountType: 'ANNUAL',
      estimatedAmountINR: 50000,
      applicationDeadline: '2026-11-30T23:59:59Z',
      applicationStartDate: '2026-08-01T00:00:00Z',
      academicYear: '2026-27',
      officialPortalUrl: 'https://mahadbt.gov.in',
      status: 'OPEN',
      eligibilitySummary: 'Maharashtra, OBC, Income <= 3L, Marks >= 60%',
      eligibilityRules: {
        maxFamilyIncome: 300000,
        minPercentage: 60.0,
        allowedCategories: ['OBC'],
        allowedStates: ['Maharashtra'],
        allowedGenders: ['ALL'],
        allowedEducationLevels: ['UNDERGRADUATE'],
        allowedCourses: ['ALL'],
        requiresDisability: false,
        requiresMinority: false,
        isIncomeStrict: true,
        mandatoryDocuments: ['INCOME_CERTIFICATE', 'CASTE_CERTIFICATE'],
      },
      requiredDocuments: [
        { name: 'Income Certificate', type: 'INCOME_CERTIFICATE', mandatory: true },
        { name: 'Caste Certificate', type: 'CASTE_CERTIFICATE', mandatory: true },
      ],
      tags: ['OBC', 'Maharashtra'],
      lastVerified: '2026-09-01T00:00:00Z',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    verifiedDocs = [
      {
        id: 'doc_inc',
        userId: 'user_1',
        documentType: 'INCOME_CERTIFICATE',
        title: 'Income Certificate',
        fileName: 'income.pdf',
        fileSizeBytes: 100000,
        mimeType: 'application/pdf',
        storagePath: 'path/income.pdf',
        status: 'VERIFIED',
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc_caste',
        userId: 'user_1',
        documentType: 'CASTE_CERTIFICATE',
        title: 'Caste Certificate',
        fileName: 'caste.pdf',
        fileSizeBytes: 100000,
        mimeType: 'application/pdf',
        storagePath: 'path/caste.pdf',
        status: 'VERIFIED',
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  it('1. should evaluate a 100% eligible student with all documents as ELIGIBLE', () => {
    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);
    expect(result.status).toBe('ELIGIBLE');
    expect(result.matchScore).toBeGreaterThanOrEqual(90);
    expect(result.mismatchReasons).toHaveLength(0);
    expect(result.missingDocuments).toHaveLength(0);
  });

  it('2. Income Eligibility: should fail when student income exceeds maximum limit', () => {
    baseStudent.familyAnnualIncome = 450000; // Exceeds 300000 limit
    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.mismatchReasons.some((r) => r.includes('exceeds'))).toBe(true);

    const incomeCheck = result.checks.find((c) => c.rule === 'income');
    expect(incomeCheck?.passed).toBe(false);
  });

  it('3. Category Eligibility: should fail when student category does not match allowed categories', () => {
    baseStudent.category = 'GENERAL';
    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.mismatchReasons.some((r) => r.includes('category'))).toBe(true);

    const categoryCheck = result.checks.find((c) => c.rule === 'category');
    expect(categoryCheck?.passed).toBe(false);
  });

  it('4. State/Domicile Eligibility: should fail when student domicile state does not match', () => {
    baseStudent.domicileState = 'Karnataka';
    if (baseStudent.education) baseStudent.education.institutionState = 'Karnataka';

    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.mismatchReasons.some((r) => r.includes('Domicile'))).toBe(true);

    const stateCheck = result.checks.find((c) => c.rule === 'state');
    expect(stateCheck?.passed).toBe(false);
  });

  it('5. Academic Cutoff: should fail when percentage is below cutoff', () => {
    if (baseStudent.education) baseStudent.education.percentageOrCgpa = 54.0; // Cutoff is 60%
    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.mismatchReasons.some((r) => r.includes('Academic score'))).toBe(true);

    const cutoffCheck = result.checks.find((c) => c.rule === 'minimumPercentage');
    expect(cutoffCheck?.passed).toBe(false);
  });

  it('6. Multiple Failed Rules: should capture and report all failed criteria simultaneously', () => {
    baseStudent.familyAnnualIncome = 600000; // Fails income
    baseStudent.category = 'SC'; // Fails category
    baseStudent.domicileState = 'Gujarat'; // Fails state
    if (baseStudent.education) {
      baseStudent.education.percentageOrCgpa = 45.0; // Fails cutoff
      baseStudent.education.institutionState = 'Gujarat';
    }

    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.mismatchReasons.length).toBeGreaterThanOrEqual(4);
    expect(result.explanation).toContain('not eligible');

    const failedChecks = result.checks.filter((c) => !c.passed);
    expect(failedChecks.length).toBeGreaterThanOrEqual(4);
  });

  it('7. Needs Verification: should return NEEDS_VERIFICATION if mandatory documents are missing', () => {
    // Passes all hard checks, but no caste certificate in vault
    const missingDocs = [verifiedDocs[0]]; // Only income cert
    const result = eligibilityService.evaluate(baseStudent, baseScholarship, missingDocs);

    expect(result.status).toBe('NEEDS_VERIFICATION');
    expect(result.missingDocuments).toContain('Caste Certificate');
    expect(result.mismatchReasons).toHaveLength(0);
    expect(result.explanation).toContain('upload and verify');
  });

  it('8. Gender Restriction: should enforce gender-specific scholarships', () => {
    baseScholarship.eligibilityRules.allowedGenders = ['FEMALE'];
    baseStudent.gender = 'MALE';

    const result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);
    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.mismatchReasons.some((r) => r.includes('applicants'))).toBe(true);
  });

  it('9. Disability Requirement: should enforce disability status and minimum percentage', () => {
    baseScholarship.eligibilityRules.requiresDisability = true;
    baseScholarship.eligibilityRules.minDisabilityPercentage = 40;

    // Student without disability
    baseStudent.isDisabled = false;
    let result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);
    expect(result.status).toBe('NOT_ELIGIBLE');

    // Student with qualifying disability
    baseStudent.isDisabled = true;
    baseStudent.disabilityPercentage = 45;
    result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);
    expect(result.status).toBe('ELIGIBLE');
  });

  it('10. Minority Requirement: should enforce minority status requirement', () => {
    baseScholarship.eligibilityRules.requiresMinority = true;

    baseStudent.minorityStatus = false;
    let result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);
    expect(result.status).toBe('NOT_ELIGIBLE');

    baseStudent.minorityStatus = true;
    result = eligibilityService.evaluate(baseStudent, baseScholarship, verifiedDocs);
    expect(result.status).toBe('ELIGIBLE');
  });
});
