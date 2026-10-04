import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';
import { logger } from './utils/logger';

// Import Route Modules
import { authRoutes } from './modules/auth/authRoutes';
import { profileRoutes } from './modules/profiles/profileRoutes';
import { scholarshipRoutes } from './modules/scholarships/scholarshipRoutes';
import { eligibilityRoutes } from './modules/eligibility/eligibilityRoutes';
import { recommendationRoutes } from './modules/recommendations/recommendationRoutes';
import { documentRoutes } from './modules/documents/documentRoutes';
import { aiRoutes } from './modules/ai/aiRoutes';
import { applicationRoutes } from './modules/applications/applicationRoutes';
import { notificationRoutes } from './modules/notifications/notificationRoutes';
import { adminRoutes } from './modules/admin/adminRoutes';

export function createApp(): Express {
  const app = express();

  // 1. Production Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Cross-Origin Resource Sharing (CORS)
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // 3. Request Body Parsers (With sensible size limits)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Request Tracing & Structured Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    res.setHeader('X-Request-Id', requestId);

    const startTime = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${durationMs}ms`, {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
      });
    });

    next();
  });

  // 5. Global Rate Limiting
  app.use(generalLimiter);

  // 6. Health Check Routes
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'ScholarSathi Backend',
      version: '1.0.0',
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // 7. Mount Core REST API Modules under /api
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/scholarships', scholarshipRoutes);
  app.use('/api/eligibility', eligibilityRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Direct alias for /api/scholarships/:id/eligibility
  app.use('/api/scholarships/:scholarshipId/eligibility', (req, res, next) => {
    req.url = `/${req.params.scholarshipId}`;
    return eligibilityRoutes(req, res, next);
  });

  // 8. 404 Route Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`));
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}
