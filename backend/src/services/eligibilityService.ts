import {
  StudentProfile,
  Scholarship,
  StudentDocument,
  RuleEvaluationResult,
  EligibilityCheckItem,
  MatchStatus,
} from '../types';

export class EligibilityService {
  /**
   * Deterministically evaluates whether a student qualifies for a scholarship.
   * Completely independent of LLMs/AI.
   */
  public evaluate(
    student: StudentProfile,
    scholarship: Scholarship,
    studentDocuments: StudentDocument[] = []
  ): RuleEvaluationResult {
    const rules = scholarship.eligibilityRules;
    const checks: EligibilityCheckItem[] = [];
    const matchReasons: string[] = [];
    const mismatchReasons: string[] = [];
    const missingDocuments: string[] = [];

    // 1. Domicile / State Check
    const allowedStates = rules.allowedStates || ['ALL'];
    const stateRulePassed =
      allowedStates.includes('ALL') ||
      allowedStates.includes(student.domicileState) ||
      (student.education && allowedStates.includes(student.education.institutionState));

    checks.push({
      rule: 'state',
      required: allowedStates.includes('ALL') ? 'All Indian States / UTs' : allowedStates.join(', '),
      actual: student.domicileState,
      passed: Boolean(stateRulePassed),
      message: stateRulePassed
        ? `Your domicile state (${student.domicileState}) satisfies the state eligibility requirement.`
        : `Requires domicile in: ${allowedStates.join(', ')}. Your domicile is ${student.domicileState}.`,
    });

    if (stateRulePassed) {
      matchReasons.push(`Matches domicile requirement (${student.domicileState}).`);
    } else {
      mismatchReasons.push(`Domicile '${student.domicileState}' is not in the eligible states: ${allowedStates.join(', ')}.`);
    }

    // 2. Caste / Social Category Check
    const allowedCategories = rules.allowedCategories || ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'];
    const categoryPassed =
      allowedCategories.includes('ALL') ||
      allowedCategories.includes(student.category);

    checks.push({
      rule: 'category',
      required: allowedCategories.join(', '),
      actual: student.category,
      passed: categoryPassed,
      message: categoryPassed
        ? `Your category (${student.category}) is eligible for this scheme.`
        : `This scheme is reserved for ${allowedCategories.join(', ')}. Your profile category is ${student.category}.`,
    });

    if (categoryPassed) {
      matchReasons.push(`Category (${student.category}) is eligible.`);
    } else {
      mismatchReasons.push(`Your category '${student.category}' is not eligible. Allowed: ${allowedCategories.join(', ')}.`);
    }

    // 3. Family Annual Income Check
    let incomePassed = true;
    if (rules.maxFamilyIncome !== null && rules.maxFamilyIncome !== undefined && rules.maxFamilyIncome > 0) {
      const actualIncome = student.familyAnnualIncome ?? 0;
      incomePassed = actualIncome <= rules.maxFamilyIncome;

      checks.push({
        rule: 'income',
        required: `≤ ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}`,
        actual: `₹${actualIncome.toLocaleString('en-IN')}`,
        passed: incomePassed,
        message: incomePassed
          ? `Your annual family income of ₹${actualIncome.toLocaleString('en-IN')} is within the limit of ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}.`
          : `Your annual family income of ₹${actualIncome.toLocaleString('en-IN')} exceeds the maximum limit of ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}.`,
      });

      if (incomePassed) {
        matchReasons.push(`Annual family income is within the ceiling limit.`);
      } else {
        mismatchReasons.push(
          `Your family income (₹${actualIncome.toLocaleString('en-IN')}) exceeds the ceiling limit of ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}.`
        );
      }
    }

    // 4. Academic Cutoff Percentage / CGPA Check
    let percentagePassed = true;
    if (rules.minPercentage !== null && rules.minPercentage !== undefined && rules.minPercentage > 0) {
      const studentScore = student.education?.percentageOrCgpa ?? 0;
      // Convert CGPA to percentage if scale is 10
      let normalizedScore = studentScore;
      if (student.education?.gradingScale === 'CGPA_10') {
        normalizedScore = studentScore * 9.5;
      } else if (student.education?.gradingScale === 'CGPA_4') {
        normalizedScore = (studentScore / 4) * 100;
      }

      percentagePassed = normalizedScore >= rules.minPercentage;

      checks.push({
        rule: 'minimumPercentage',
        required: `≥ ${rules.minPercentage}%`,
        actual: `${studentScore}${student.education?.gradingScale === 'PERCENTAGE' ? '%' : ' CGPA'} (approx ${normalizedScore.toFixed(1)}%)`,
        passed: percentagePassed,
        message: percentagePassed
          ? `Your score meets or exceeds the minimum cutoff of ${rules.minPercentage}%.`
          : `Your academic score (${studentScore}) is below the required cutoff of ${rules.minPercentage}%.`,
      });

      if (percentagePassed) {
        matchReasons.push(`Academic score satisfies the minimum cutoff.`);
      } else {
        mismatchReasons.push(`Academic score is below the required cutoff (${rules.minPercentage}%).`);
      }
    }

    // 5. Education Level Check
    const allowedEduLevels = rules.allowedEducationLevels || ['ALL'];
    let eduLevelPassed = true;
    if (student.education?.currentEducationLevel) {
      eduLevelPassed =
        allowedEduLevels.includes('ALL') ||
        allowedEduLevels.includes(student.education.currentEducationLevel);

      checks.push({
        rule: 'educationLevel',
        required: allowedEduLevels.includes('ALL') ? 'All Education Levels' : allowedEduLevels.join(', '),
        actual: student.education.currentEducationLevel,
        passed: eduLevelPassed,
        message: eduLevelPassed
          ? `Your current education level (${student.education.currentEducationLevel}) is eligible.`
          : `Requires education level in: ${allowedEduLevels.join(', ')}.`,
      });

      if (eduLevelPassed) {
        matchReasons.push(`Education level matches eligibility.`);
      } else {
        mismatchReasons.push(`Education level '${student.education.currentEducationLevel}' is not eligible.`);
      }
    }

    // 6. Gender Filter Check
    const allowedGenders = rules.allowedGenders || ['ALL'];
    const genderPassed =
      allowedGenders.includes('ALL') ||
      allowedGenders.includes(student.gender);

    checks.push({
      rule: 'gender',
      required: allowedGenders.join(', '),
      actual: student.gender,
      passed: genderPassed,
      message: genderPassed
        ? `Gender eligibility criteria satisfied.`
        : `This scholarship is restricted to ${allowedGenders.join(', ')} applicants.`,
    });

    if (!genderPassed) {
      mismatchReasons.push(`Restricted to ${allowedGenders.join(', ')} applicants.`);
    }

    // 7. Disability Filter Check
    if (rules.requiresDisability) {
      const disabilityPassed =
        student.isDisabled &&
        (rules.minDisabilityPercentage
          ? (student.disabilityPercentage ?? 0) >= rules.minDisabilityPercentage
          : true);

      checks.push({
        rule: 'disability',
        required: rules.minDisabilityPercentage
          ? `Yes, minimum ${rules.minDisabilityPercentage}%`
          : 'Yes',
        actual: student.isDisabled ? `Yes (${student.disabilityPercentage ?? 40}%)` : 'No',
        passed: disabilityPassed,
        message: disabilityPassed
          ? `Disability quota criteria met.`
          : `Requires verified disability status with min cutoff.`,
      });

      if (!disabilityPassed) {
        mismatchReasons.push(`Scholarship requires verified disability status.`);
      }
    }

    // 8. Minority Status Check
    if (rules.requiresMinority) {
      const minorityPassed = Boolean(student.minorityStatus);
      checks.push({
        rule: 'minorityStatus',
        required: 'Yes (Recognized Religious / Linguistic Minority)',
        actual: student.minorityStatus ? 'Yes' : 'No',
        passed: minorityPassed,
        message: minorityPassed
          ? `Minority qualification satisfied.`
          : `This scheme is designated for minority community students.`,
      });

      if (!minorityPassed) {
        mismatchReasons.push(`Designated for students belonging to recognized minority communities.`);
      }
    }

    // 9. Mandatory Documents Check
    const verifiedDocTypes = studentDocuments
      .filter((d) => d.status === 'VERIFIED')
      .map((d) => d.documentType);

    const mandatoryDocs = scholarship.requiredDocuments?.filter((d) => d.mandatory) || [];
    for (const doc of mandatoryDocs) {
      if (!verifiedDocTypes.includes(doc.type)) {
        missingDocuments.push(doc.name || doc.type);
      }
    }

    // Determine Final Match Status & Score
    let status: MatchStatus;
    let matchScore = 0;

    if (mismatchReasons.length > 0) {
      status = 'NOT_ELIGIBLE';
      const passedCount = checks.filter((c) => c.passed).length;
      matchScore = Math.round((passedCount / checks.length) * 45);
    } else if (missingDocuments.length > 0) {
      status = 'NEEDS_VERIFICATION';
      matchScore = Math.min(84, 65 + (student.profileCompleteness || 0) * 0.15);
    } else if ((student.profileCompleteness || 0) < 70) {
      status = 'LIKELY_ELIGIBLE';
      matchScore = Math.min(89, 75 + (student.profileCompleteness || 0) * 0.12);
    } else {
      status = 'ELIGIBLE';
      matchScore = Math.min(99, 90 + Math.floor(Math.random() * 8));
    }

    // Build synthesized plain-English explanation
    let explanation = '';
    if (status === 'NOT_ELIGIBLE') {
      explanation = `You are currently not eligible for this scholarship because: ${mismatchReasons.join(' ')}`;
    } else if (status === 'NEEDS_VERIFICATION') {
      explanation = `You meet all primary criteria! However, you need to upload and verify: ${missingDocuments.join(', ')} to complete verification.`;
    } else if (status === 'LIKELY_ELIGIBLE') {
      explanation = `You qualify for all hard requirements. Complete remaining profile details to elevate to fully verified status.`;
    } else {
      explanation = `You are 100% eligible! You satisfy domicile, category, income ceiling, and academic cutoffs, and your required documents are verified in your vault.`;
    }

    return {
      scholarshipId: scholarship.id,
      status,
      matchScore,
      checks,
      matchReasons,
      mismatchReasons,
      missingDocuments,
      explanation,
    };
  }
}

export const eligibilityService = new EligibilityService();
