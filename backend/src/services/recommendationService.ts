import { dbService } from './db';
import { eligibilityService } from './eligibilityService';
import { StudentProfile, Scholarship } from '../types';

export interface RecommendationItem {
  scholarshipId: string;
  name: string;
  slug: string;
  providerName: string;
  providerType: string;
  status: string;
  matchScore: number;
  rankingScore: number;
  reasons: string[];
  mismatchReasons: string[];
  missingDocuments: string[];
  deadline: string;
  estimatedAmount: string;
  estimatedAmountINR: number;
  officialPortalUrl: string;
  explanation: string;
}

export class RecommendationService {
  /**
   * Generates personalized and ranked recommendations for a student profile
   */
  public async getRecommendations(userId: string): Promise<RecommendationItem[]> {
    // 1. Fetch user profile and uploaded documents
    const profile = await dbService.getProfile(userId);
    if (!profile) {
      return [];
    }

    const documents = await dbService.getDocuments(userId);

    // 2. Fetch all active candidate scholarships
    const allScholarships = await dbService.getScholarships({ status: 'OPEN' });

    // 3. Evaluate each scholarship deterministically
    const evaluatedList = allScholarships.map((scholarship) => {
      const result = eligibilityService.evaluate(profile, scholarship, documents);
      const rankingScore = this.calculateRankingScore(result.status, scholarship, profile);

      return {
        scholarshipId: scholarship.id,
        name: scholarship.title,
        slug: scholarship.slug,
        providerName: scholarship.provider.name,
        providerType: scholarship.provider.type,
        status: result.status,
        matchScore: result.matchScore,
        rankingScore: Math.round(rankingScore * 10) / 10,
        reasons: result.matchReasons,
        mismatchReasons: result.mismatchReasons,
        missingDocuments: result.missingDocuments,
        deadline: scholarship.applicationDeadline,
        estimatedAmount: scholarship.financialAssistance,
        estimatedAmountINR: scholarship.estimatedAmountINR,
        officialPortalUrl: scholarship.officialPortalUrl,
        explanation: result.explanation,
      };
    });

    // 4. Sort: ELIGIBLE first, then LIKELY_ELIGIBLE, then NEEDS_VERIFICATION, sorted by rankingScore descending
    const statusWeightMap: Record<string, number> = {
      ELIGIBLE: 4,
      LIKELY_ELIGIBLE: 3,
      NEEDS_VERIFICATION: 2,
      NOT_ELIGIBLE: 1,
    };

    evaluatedList.sort((a, b) => {
      const weightDiff = (statusWeightMap[b.status] || 0) - (statusWeightMap[a.status] || 0);
      if (weightDiff !== 0) return weightDiff;
      return b.rankingScore - a.rankingScore;
    });

    return evaluatedList;
  }

  /**
   * Computes a multi-factor priority ranking score:
   * Score = (0.50 * Status) + (0.25 * Deadline Urgency) + (0.15 * Financial Benefit) + (0.10 * Profile Completeness)
   */
  private calculateRankingScore(status: string, scholarship: Scholarship, profile: StudentProfile): number {
    // 1. Status Factor (0 to 100)
    let statusScore = 20;
    if (status === 'ELIGIBLE') statusScore = 100;
    else if (status === 'LIKELY_ELIGIBLE') statusScore = 80;
    else if (status === 'NEEDS_VERIFICATION') statusScore = 60;

    // 2. Deadline Urgency Factor (0 to 100)
    let deadlineScore = 50;
    try {
      const now = Date.now();
      const deadlineTime = new Date(scholarship.applicationDeadline).getTime();
      const daysRemaining = (deadlineTime - now) / (1000 * 60 * 60 * 24);

      if (daysRemaining < 0) {
        deadlineScore = 0;
      } else if (daysRemaining <= 7) {
        deadlineScore = 100; // Critical urgency
      } else if (daysRemaining <= 21) {
        deadlineScore = 85; // High urgency
      } else if (daysRemaining <= 45) {
        deadlineScore = 70; // Medium
      } else {
        deadlineScore = 50; // Plenty of time
      }
    } catch {
      deadlineScore = 50;
    }

    // 3. Benefit Factor (0 to 100) based on estimated amount
    const amount = scholarship.estimatedAmountINR || 0;
    let benefitScore = 40;
    if (amount >= 100000) benefitScore = 100;
    else if (amount >= 50000) benefitScore = 85;
    else if (amount >= 25000) benefitScore = 70;
    else if (amount > 0) benefitScore = 55;

    // 4. Profile Completeness (0 to 100)
    const completenessScore = profile.profileCompleteness || 50;

    return (
      statusScore * 0.50 +
      deadlineScore * 0.25 +
      benefitScore * 0.15 +
      completenessScore * 0.10
    );
  }
}

export const recommendationService = new RecommendationService();
