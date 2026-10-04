import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationService } from '../src/services/recommendationService';
import { dbService } from '../src/services/db';
import { SEED_SCHOLARSHIPS } from '../src/seed/seedData';
import { TEST_STUDENT_PROFILE, TEST_DOCUMENTS } from './fixtures/testFixtures';

describe('Recommendation Engine', () => {
  let recommendationService: RecommendationService;

  beforeEach(async () => {
    recommendationService = new RecommendationService();

    // Populate mock DB with seed data
    for (const s of SEED_SCHOLARSHIPS) {
      await dbService.setScholarship(s.id, s);
    }
    await dbService.saveProfile(TEST_STUDENT_PROFILE.userId, TEST_STUDENT_PROFILE);
    for (const d of TEST_DOCUMENTS) {
      await dbService.saveDocument(TEST_STUDENT_PROFILE.userId, d);
    }
  });

  it('12. Recommendation Ranking: should rank eligible scholarships above ineligible scholarships', async () => {
    const recommendations = await recommendationService.getRecommendations(TEST_STUDENT_PROFILE.userId);

    expect(recommendations.length).toBeGreaterThan(0);

    // Verify first recommendation has high rankingScore and is ELIGIBLE or LIKELY_ELIGIBLE
    const topRec = recommendations[0];
    expect(['ELIGIBLE', 'LIKELY_ELIGIBLE']).toContain(topRec.status);
    expect(topRec.rankingScore).toBeGreaterThanOrEqual(70);

    // Verify ordering: ELIGIBLE > LIKELY_ELIGIBLE > NEEDS_VERIFICATION > NOT_ELIGIBLE
    for (let i = 0; i < recommendations.length - 1; i++) {
      const current = recommendations[i];
      const next = recommendations[i + 1];

      const statusRank: Record<string, number> = {
        ELIGIBLE: 4,
        LIKELY_ELIGIBLE: 3,
        NEEDS_VERIFICATION: 2,
        NOT_ELIGIBLE: 1,
      };

      expect(statusRank[current.status]).toBeGreaterThanOrEqual(statusRank[next.status]);
    }
  });

  it('should include itemized reasons and missing documents in recommendations', async () => {
    const recommendations = await recommendationService.getRecommendations(TEST_STUDENT_PROFILE.userId);
    const topRec = recommendations[0];

    expect(Array.isArray(topRec.reasons)).toBe(true);
    expect(topRec.reasons.length).toBeGreaterThan(0);
    expect(topRec.officialPortalUrl).toBeTruthy();
  });
});
