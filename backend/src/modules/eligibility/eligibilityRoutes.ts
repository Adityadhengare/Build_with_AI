import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { dbService } from '../../services/db';
import { eligibilityService } from '../../services/eligibilityService';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/scholarships/:id/eligibility OR /api/eligibility/:id
router.get(
  '/:scholarshipId',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { scholarshipId } = req.params;

      const scholarship = await dbService.getScholarshipById(scholarshipId);
      if (!scholarship) {
        throw new NotFoundError(`Scholarship with ID '${scholarshipId}' was not found.`);
      }

      const profile = await dbService.getProfile(userId);
      if (!profile) {
        throw new NotFoundError('Student profile not found. Please complete your profile to check eligibility.');
      }

      const docs = await dbService.getDocuments(userId);
      const result = eligibilityService.evaluate(profile, scholarship, docs);

      res.status(200).json({
        success: true,
        data: {
          scholarshipId,
          scholarshipTitle: scholarship.title,
          status: result.status,
          matchScore: result.matchScore,
          explanation: result.explanation,
          checks: result.checks,
          passedRules: result.matchReasons,
          failedReasons: result.checks
            .filter((c) => !c.passed)
            .map((c) => ({
              field: c.rule,
              required: c.required,
              actual: c.actual,
              message: c.message,
            })),
          missingDocuments: result.missingDocuments,
          verifiedDocumentsCount: docs.filter((d) => d.status === 'VERIFIED').length,
          officialPortalUrl: scholarship.officialPortalUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/eligibility/check (Direct evaluation of student attributes)
router.post(
  '/check',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { scholarshipId, customProfile } = req.body;

      const scholarship = await dbService.getScholarshipById(scholarshipId);
      if (!scholarship) {
        throw new NotFoundError('Scholarship not found.');
      }

      const baseProfile = await dbService.getProfile(userId);
      const profileToEvaluate = customProfile
        ? { ...(baseProfile || {}), ...customProfile }
        : baseProfile;

      if (!profileToEvaluate) {
        throw new NotFoundError('No student profile available for evaluation.');
      }

      const docs = await dbService.getDocuments(userId);
      const result = eligibilityService.evaluate(profileToEvaluate, scholarship, docs);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const eligibilityRoutes = router;
