import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Skip rate limiting entirely in non-production environments.
// Rate limiting is only meaningful in production to protect against abuse.
const skipInDev = () => env.NODE_ENV !== 'production';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Upload rate limit reached. Maximum 30 uploads per hour.',
    },
  },
});

export const aiAssistantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'AI Assistant query limit reached. Please wait a bit before asking more questions.',
    },
  },
});
