import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { recommendationService } from '../../services/recommendationService';

const router = Router();

// GET /api/recommendations
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const recommendations = await recommendationService.getRecommendations(userId);

      res.status(200).json({
        success: true,
        data: {
          totalRecommendations: recommendations.length,
          recommendations,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const recommendationRoutes = router;
