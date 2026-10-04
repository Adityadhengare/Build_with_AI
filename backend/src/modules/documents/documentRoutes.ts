import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticateToken } from '../../middleware/auth';
import { uploadLimiter } from '../../middleware/rateLimit';
import { validateRequest } from '../../middleware/validation';
import { documentService } from '../../services/documentService';
import { dbService } from '../../services/db';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { DocumentType } from '../../types';

const router = Router();

// Configure Multer with in-memory storage and 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

const DocumentVerifySchema = z.object({
  confirmedIncome: z.number().nonnegative().optional(),
  confirmedCategory: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER']).optional(),
  confirmedPercentage: z.number().min(0).max(100).optional(),
  confirmedState: z.string().optional(),
});

// POST /api/documents/upload
router.post(
  '/upload',
  authenticateToken,
  uploadLimiter,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;

      if (!req.file) {
        throw new BadRequestError('No file was uploaded. Please attach a valid PDF or image file.');
      }

      const documentType = (req.body.documentType as DocumentType) || 'OTHER';

      const doc = await documentService.uploadAndProcessDocument(
        userId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        documentType
      );

      res.status(202).json({
        success: true,
        data: {
          documentId: doc.id,
          fileName: doc.fileName,
          title: doc.title,
          documentType: doc.documentType,
          status: doc.status,
          extraction: doc.extraction,
          authorityBadge: doc.authorityBadge,
          message: 'File uploaded securely and processed via Gemini document intelligence.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/documents
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const documents = await dbService.getDocuments(userId);

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/documents/:id
router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const doc = await dbService.getDocumentById(userId, id);
      if (!doc) {
        throw new NotFoundError('Document not found in your vault.');
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/documents/:id/verify (Student confirms or updates extracted fields)
router.post(
  '/:id/verify',
  authenticateToken,
  validateRequest({ body: DocumentVerifySchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const updated = await documentService.verifyAndConfirmDocument(userId, id, req.body);

      res.status(200).json({
        success: true,
        data: {
          documentId: updated.id,
          status: updated.status,
          message: 'Document verified and profile attributes synchronized successfully.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/documents/:id
router.delete(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const doc = await dbService.getDocumentById(userId, id);
      if (!doc) {
        throw new NotFoundError('Document not found.');
      }

      await dbService.deleteDocument(userId, id);

      res.status(200).json({
        success: true,
        data: {
          deleted: true,
          message: 'Document deleted from vault.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const documentRoutes = router;
