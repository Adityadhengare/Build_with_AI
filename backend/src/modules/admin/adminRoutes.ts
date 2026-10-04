import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { dbService } from '../../services/db';
import { NotFoundError } from '../../utils/errors';
import { Scholarship } from '../../types';

const router = Router();

// Apply Authentication and Admin RBAC to all routes in this router
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

const ScholarshipCreateSchema = z.object({
  title: z.string().min(3),
  provider: z
    .object({
      name: z.string().min(1),
      type: z.enum(['GOVERNMENT_CENTRAL', 'GOVERNMENT_STATE', 'PRIVATE_TRUST', 'CORPORATE_CSR', 'NGO']),
      websiteUrl: z.string().url(),
      state: z.string().optional(),
      contactEmail: z.string().email().optional(),
    })
    .optional(),
  providerName: z.string().optional(),
  providerType: z.enum(['GOVERNMENT_CENTRAL', 'GOVERNMENT_STATE', 'PRIVATE_TRUST', 'CORPORATE_CSR', 'NGO']).optional(),
  description: z.string().min(10),
  financialAssistance: z.string().min(1),
  amountType: z.enum(['ANNUAL', 'ONE_TIME', 'MONTHLY', 'COURSE_DURATION']).default('ANNUAL'),
  estimatedAmountINR: z.number().nonnegative().default(50000),
  applicationDeadline: z.string(),
  applicationStartDate: z.string().optional(),
  academicYear: z.string().default('2026-27'),
  officialPortalUrl: z.string().url(),
  sourceUrl: z.string().optional(),
  status: z.enum(['OPEN', 'UPCOMING', 'CLOSED', 'DRAFT', 'ARCHIVED']).default('OPEN'),
  isFeatured: z.boolean().default(false),
  eligibilitySummary: z.string().default('See detailed criteria'),
  eligibilityRules: z
    .object({
      maxFamilyIncome: z.number().nullable().optional(),
      minPercentage: z.number().nullable().optional(),
      allowedCategories: z.array(z.string()).default(['ALL']),
      allowedStates: z.array(z.string()).default(['ALL']),
      allowedGenders: z.array(z.string()).default(['ALL']),
      allowedEducationLevels: z.array(z.string()).default(['ALL']),
      allowedCourses: z.array(z.string()).default(['ALL']),
      requiresDisability: z.boolean().default(false),
      minDisabilityPercentage: z.number().nullable().optional(),
      requiresMinority: z.boolean().default(false),
      isIncomeStrict: z.boolean().default(true),
      mandatoryDocuments: z.array(z.string()).optional(),
    })
    .optional(),
  requiredDocuments: z
    .array(
      z.object({
        name: z.string(),
        type: z.any(),
        mandatory: z.boolean(),
        description: z.string().optional(),
      })
    )
    .default([]),
  tags: z.array(z.string()).default([]),
});

// GET /api/admin/metrics
router.get(
  '/metrics',
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

// GET /api/admin/scholarships (All scholarships including drafts and archived)
router.get(
  '/scholarships',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const scholarships = await dbService.getScholarships();
      res.status(200).json({
        success: true,
        data: scholarships,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/scholarships (Create new scholarship)
router.post(
  '/scholarships',
  validateRequest({ body: ScholarshipCreateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUserId = req.user!.uid;
      const b = req.body;
      const id = `sch_${Date.now()}`;
      const now = new Date().toISOString();

      const newScholarship: Scholarship = {
        id,
        title: b.title,
        slug: b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        provider: b.provider || {
          name: b.providerName || 'Government Body',
          type: b.providerType || 'GOVERNMENT_STATE',
          websiteUrl: b.officialPortalUrl,
        },
        description: b.description,
        financialAssistance: b.financialAssistance,
        amountType: b.amountType || 'ANNUAL',
        estimatedAmountINR: b.estimatedAmountINR || 50000,
        applicationDeadline: b.applicationDeadline,
        applicationStartDate: b.applicationStartDate || now,
        academicYear: b.academicYear || '2026-27',
        officialPortalUrl: b.officialPortalUrl,
        sourceUrl: b.sourceUrl || b.officialPortalUrl,
        status: b.status || 'OPEN',
        isFeatured: b.isFeatured || false,
        eligibilitySummary: b.eligibilitySummary,
        eligibilityRules: b.eligibilityRules || {
          maxFamilyIncome: 500000,
          minPercentage: 60,
          allowedCategories: ['ALL'],
          allowedStates: ['ALL'],
          allowedGenders: ['ALL'],
          allowedEducationLevels: ['UNDERGRADUATE'],
          allowedCourses: ['ALL'],
          requiresDisability: false,
          requiresMinority: false,
          isIncomeStrict: true,
          mandatoryDocuments: ['INCOME_CERTIFICATE'],
        },
        requiredDocuments: b.requiredDocuments || [],
        tags: b.tags || ['Scholarship'],
        lastVerified: now,
        createdAt: now,
        updatedAt: now,
      };

      await dbService.setScholarship(id, newScholarship);

      // Create Audit Log
      await dbService.addAuditLog({
        id: `audit_${Date.now()}`,
        actorUserId,
        action: 'SCHOLARSHIP_CREATED',
        entityType: 'SCHOLARSHIP',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { title: b.title, status: b.status },
        timestamp: now,
      });

      res.status(201).json({
        success: true,
        data: newScholarship,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/scholarships/:id (Update scholarship & eligibility rules)
router.put(
  '/scholarships/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUserId = req.user!.uid;
      const { id } = req.params;
      const b = req.body;

      const existing = await dbService.getScholarshipById(id);
      if (!existing) {
        throw new NotFoundError('Scholarship not found.');
      }

      const updated: Scholarship = {
        ...existing,
        ...b,
        updatedAt: new Date().toISOString(),
      };

      await dbService.setScholarship(id, updated);

      // Create Audit Log
      await dbService.addAuditLog({
        id: `audit_${Date.now()}`,
        actorUserId,
        action: 'SCHOLARSHIP_UPDATED',
        entityType: 'SCHOLARSHIP',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { fieldsUpdated: Object.keys(b) },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/scholarships/:id (Archive or delete)
router.delete(
  '/scholarships/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUserId = req.user!.uid;
      const { id } = req.params;

      const existing = await dbService.getScholarshipById(id);
      if (!existing) {
        throw new NotFoundError('Scholarship not found.');
      }

      await dbService.deleteScholarship(id);

      // Create Audit Log
      await dbService.addAuditLog({
        id: `audit_${Date.now()}`,
        actorUserId,
        action: 'SCHOLARSHIP_DELETED',
        entityType: 'SCHOLARSHIP',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { title: existing.title },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        data: {
          deleted: true,
          message: 'Scholarship deleted successfully.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/audit-logs
router.get(
  '/audit-logs',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await dbService.getAuditLogs(limit);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/students (Real student directory)
router.get(
  '/students',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const students = await dbService.getAllStudents();
      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/applications (Real application oversight across all users)
router.get(
  '/applications',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applications = await dbService.getAllApplications();
      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const adminRoutes = router;
