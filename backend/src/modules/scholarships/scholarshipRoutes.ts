import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { optionalAuthenticate, authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { dbService } from '../../services/db';
import { eligibilityService } from '../../services/eligibilityService';
import { NotFoundError } from '../../utils/errors';

const router = Router();

const ScholarshipQuerySchema = z.object({
  search: z.string().optional(),
  query: z.string().optional(),
  q: z.string().optional(),
  provider: z.string().optional(),
  providerType: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  educationLevel: z.string().optional(),
  education: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
  page: z.string().default('1').transform((v) => parseInt(v, 10)),
  limit: z.string().default('20').transform((v) => parseInt(v, 10)),
  sortBy: z.enum(['match', 'deadline', 'amount']).optional(),
});

// GET /api/scholarships/saved (Saved bookmarks) - Placed before /:id to prevent route shadowing
router.get(
  '/saved',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const saved = await dbService.getSavedScholarships(userId);
      const schIds = saved.map((s) => s.scholarshipId);

      const scholarships = (
        await Promise.all(schIds.map((id) => dbService.getScholarshipById(id)))
      ).filter(Boolean);

      res.status(200).json({
        success: true,
        data: scholarships,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/scholarships (Global catalog search & filtering)
router.get(
  '/',
  optionalAuthenticate,
  validateRequest({ query: ScholarshipQuerySchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as any;
      const searchTerm = q.search || q.query || q.q;
      const eduLevel = q.educationLevel || q.education;

      const allMatches = await dbService.getScholarships({
        search: searchTerm,
        providerType: q.providerType,
        state: q.state,
        category: q.category,
        educationLevel: eduLevel,
        gender: q.gender,
        status: q.status || 'OPEN',
      });

      // If user is authenticated and has a profile, compute deterministic matchScore & matchStatus
      let enriched = allMatches;
      if (req.user) {
        const profile = await dbService.getProfile(req.user.uid);
        const docs = await dbService.getDocuments(req.user.uid);

        if (profile) {
          enriched = allMatches.map((s) => {
            const evalResult = eligibilityService.evaluate(profile, s, docs);
            return {
              ...s,
              matchScore: evalResult.matchScore,
              matchStatus: evalResult.status,
            };
          });
        } else {
          enriched = allMatches.map((s) => ({
            ...s,
            matchScore: 0,
            matchStatus: undefined,
          }));
        }
      } else {
        enriched = allMatches.map((s) => ({
          ...s,
          matchScore: 0,
          matchStatus: undefined,
        }));
      }

      // Sort
      if (q.sortBy === 'deadline') {
        enriched.sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());
      } else if (q.sortBy === 'amount') {
        enriched.sort((a, b) => (b.estimatedAmountINR || 0) - (a.estimatedAmountINR || 0));
      } else {
        // Match score descending
        enriched.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      // Pagination
      const page = q.page || 1;
      const limit = Math.min(100, q.limit || 20);
      const total = enriched.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = enriched.slice((page - 1) * limit, page * limit);

      res.status(200).json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/scholarships/stats (Public platform aggregate metrics)
router.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await dbService.getPlatformStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/scholarships/:id (Detailed view)
router.get(
  '/:id',
  optionalAuthenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const scholarship = await dbService.getScholarshipById(id);

      if (!scholarship) {
        throw new NotFoundError(`Scholarship with identifier '${id}' not found.`);
      }

      let enriched: any = { ...scholarship };

      if (req.user) {
        const profile = await dbService.getProfile(req.user.uid);
        const docs = await dbService.getDocuments(req.user.uid);
        if (profile) {
          const evalResult = eligibilityService.evaluate(profile, scholarship, docs);
          enriched = {
            ...scholarship,
            matchScore: evalResult.matchScore,
            matchStatus: evalResult.status,
            eligibilityEvaluation: evalResult,
          };
        }
      }

      res.status(200).json({
        success: true,
        data: enriched,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/scholarships/:id/save (Bookmark scholarship)
router.post(
  '/:id/save',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const scholarship = await dbService.getScholarshipById(id);

      if (!scholarship) {
        throw new NotFoundError('Scholarship not found.');
      }

      await dbService.saveScholarshipBookmark(userId, id, req.body?.notes);

      res.status(200).json({
        success: true,
        data: {
          saved: true,
          scholarshipId: id,
          message: 'Scholarship bookmarked to your saved list.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/scholarships/:id/save (Remove bookmark)
router.delete(
  '/:id/save',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      await dbService.removeSavedScholarship(userId, id);

      res.status(200).json({
        success: true,
        data: {
          saved: false,
          scholarshipId: id,
          message: 'Scholarship removed from your saved list.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const scholarshipRoutes = router;
