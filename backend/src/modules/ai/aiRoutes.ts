import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../../middleware/auth';
import { aiAssistantLimiter } from '../../middleware/rateLimit';
import { validateRequest } from '../../middleware/validation';
import { aiAssistantService } from '../../services/aiAssistantService';
import { eligibilityService } from '../../services/eligibilityService';
import { dbService } from '../../services/db';
import { NotFoundError } from '../../utils/errors';

const router = Router();

const ChatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  query: z.string().min(1).max(1000).optional(),
  conversationId: z.string().optional(),
  contextScholarshipId: z.string().optional(),
  scholarshipId: z.string().optional(),
});

// POST /api/ai/chat
router.post(
  '/chat',
  authenticateToken,
  aiAssistantLimiter,
  validateRequest({ body: ChatMessageSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const b = req.body;
      const queryMessage = b.message || b.query;
      const contextId = b.contextScholarshipId || b.scholarshipId;

      const result = await aiAssistantService.handleChat(userId, queryMessage, contextId);

      res.status(200).json({
        success: true,
        data: {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          content: result.reply,
          reply: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolsUsed: result.toolsUsed,
          suggestedCards: result.suggestedCards,
          conversationId: b.conversationId || `conv_${Date.now()}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/ai/explain-eligibility/:scholarshipId
router.post(
  '/explain-eligibility/:scholarshipId',
  authenticateToken,
  aiAssistantLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { scholarshipId } = req.params;

      const scholarship = await dbService.getScholarshipById(scholarshipId);
      if (!scholarship) {
        throw new NotFoundError('Scholarship not found.');
      }

      const profile = await dbService.getProfile(userId);
      if (!profile) {
        throw new NotFoundError('Student profile not found.');
      }

      const docs = await dbService.getDocuments(userId);
      const evalResult = eligibilityService.evaluate(profile, scholarship, docs);

      res.status(200).json({
        success: true,
        data: {
          scholarshipId,
          title: scholarship.title,
          status: evalResult.status,
          matchScore: evalResult.matchScore,
          explanation: evalResult.explanation,
          matchReasons: evalResult.matchReasons,
          mismatchReasons: evalResult.mismatchReasons,
          missingDocuments: evalResult.missingDocuments,
          checks: evalResult.checks,
          officialPortalUrl: scholarship.officialPortalUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const aiRoutes = router;
