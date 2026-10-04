import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { dbService } from '../../services/db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { ApplicationRecord, ApplicationStatus } from '../../types';

const router = Router();

const ApplicationCreateSchema = z.object({
  scholarshipId: z.string().min(1),
  scholarshipTitle: z.string().optional(),
  providerName: z.string().optional(),
  providerType: z.string().optional(),
  status: z
    .enum([
      'SAVED',
      'NOT_STARTED',
      'IN_PROGRESS',
      'APPLIED',
      'UNDER_REVIEW',
      'SELECTED',
      'REJECTED',
      'APPLIED_ON_OFFICIAL_PORTAL',
      'AWARDED',
    ])
    .optional(),
  applicationStatus: z.string().optional(),
  officialApplicationId: z.string().optional(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  estimatedAmount: z.string().optional(),
  officialPortalUrl: z.string().optional(),
  notes: z.string().optional(),
});

const ApplicationStatusUpdateSchema = z.object({
  status: z
    .enum([
      'SAVED',
      'NOT_STARTED',
      'IN_PROGRESS',
      'APPLIED',
      'UNDER_REVIEW',
      'SELECTED',
      'REJECTED',
      'APPLIED_ON_OFFICIAL_PORTAL',
      'AWARDED',
    ])
    .optional(),
  applicationStatus: z.string().optional(),
  officialApplicationId: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/applications (List authenticated user's tracked applications)
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const applications = await dbService.getApplications(userId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/applications/:id
router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const app = await dbService.getApplicationById(userId, id);
      if (!app) {
        throw new NotFoundError('Application record not found.');
      }

      // Explicit IDOR check
      if (app.userId !== userId) {
        throw new ForbiddenError('You cannot view applications belonging to other users.');
      }

      res.status(200).json({
        success: true,
        data: app,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/applications (Create new tracked application)
router.post(
  '/',
  authenticateToken,
  validateRequest({ body: ApplicationCreateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const b = req.body;

      const scholarship = await dbService.getScholarshipById(b.scholarshipId);

      const appId = `app_${Date.now()}`;
      const now = new Date().toISOString();

      let mappedStatus: ApplicationStatus = 'APPLIED';
      const inputStatus = b.status || b.applicationStatus;
      if (inputStatus === 'SAVED') mappedStatus = 'SAVED';
      else if (inputStatus === 'UNDER_REVIEW') mappedStatus = 'UNDER_REVIEW';
      else if (inputStatus === 'SELECTED' || inputStatus === 'AWARDED') mappedStatus = 'SELECTED';
      else if (inputStatus === 'REJECTED') mappedStatus = 'REJECTED';
      else if (inputStatus === 'IN_PROGRESS') mappedStatus = 'IN_PROGRESS';

      const newApp: ApplicationRecord = {
        id: appId,
        userId,
        scholarshipId: b.scholarshipId,
        scholarshipTitle: b.scholarshipTitle || scholarship?.title || 'Scholarship Scheme',
        providerName: b.providerName || scholarship?.provider.name || 'Provider',
        providerType: b.providerType || scholarship?.provider.type || 'GOVERNMENT_STATE',
        status: mappedStatus,
        officialApplicationId: b.officialApplicationId,
        appliedDate: b.appliedDate || now.split('T')[0],
        deadline: b.deadline || scholarship?.applicationDeadline || '2026-11-30',
        estimatedAmount: b.estimatedAmount || scholarship?.financialAssistance || 'Fee Reimbursement',
        officialPortalUrl: b.officialPortalUrl || scholarship?.officialPortalUrl || 'https://scholarships.gov.in',
        notes: b.notes || '',
        createdAt: now,
        lastUpdated: now.split('T')[0],
      };

      await dbService.saveApplication(userId, newApp);

      res.status(201).json({
        success: true,
        data: newApp,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/applications/:id/status
router.put(
  '/:id/status',
  authenticateToken,
  validateRequest({ body: ApplicationStatusUpdateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const b = req.body;

      const app = await dbService.getApplicationById(userId, id);
      if (!app) {
        throw new NotFoundError('Application record not found.');
      }

      if (app.userId !== userId) {
        throw new ForbiddenError('Access denied: You do not own this application.');
      }

      if (b.status || b.applicationStatus) {
        const inputStatus = b.status || b.applicationStatus;
        if (['SAVED', 'NOT_STARTED', 'IN_PROGRESS', 'APPLIED', 'UNDER_REVIEW', 'SELECTED', 'REJECTED'].includes(inputStatus)) {
          app.status = inputStatus as ApplicationStatus;
        }
      }

      if (b.officialApplicationId !== undefined) {
        app.officialApplicationId = b.officialApplicationId;
      }
      if (b.notes !== undefined) {
        app.notes = b.notes;
      }

      app.lastUpdated = new Date().toISOString().split('T')[0];

      await dbService.saveApplication(userId, app);

      res.status(200).json({
        success: true,
        data: app,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/applications/:id
router.delete(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const app = await dbService.getApplicationById(userId, id);
      if (!app) {
        throw new NotFoundError('Application not found.');
      }

      if (app.userId !== userId) {
        throw new ForbiddenError('Access denied.');
      }

      await dbService.deleteApplication(userId, id);

      res.status(200).json({
        success: true,
        data: {
          deleted: true,
          message: 'Application tracker record deleted.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const applicationRoutes = router;
