import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { dbService } from '../../services/db';

const router = Router();

// GET /api/notifications
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const notifications = await dbService.getNotifications(userId);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/notifications/:id/read
router.patch(
  '/:id/read',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const updated = await dbService.markNotificationRead(userId, id);

      res.status(200).json({
        success: true,
        data: {
          id,
          isRead: updated,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/notifications/read-all
router.patch(
  '/read-all',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      await dbService.markAllNotificationsRead(userId);

      res.status(200).json({
        success: true,
        data: {
          allRead: true,
          message: 'All notifications marked as read.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const notificationRoutes = router;
