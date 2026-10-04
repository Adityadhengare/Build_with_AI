import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api'),
  CORS_ORIGIN: z.string().default('*'),
  FIREBASE_PROJECT_ID: z.string().default('scholarsaathi-549cd'),
  FIREBASE_STORAGE_BUCKET: z.string().default('scholarsaathi-549cd.appspot.com'),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  USE_FIREBASE_EMULATOR_OR_MOCK: z
    .string()
    .optional()
    .transform((v) => v === 'true' || process.env.NODE_ENV === 'test'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_FLASH: z.string().default('gemini-1.5-flash'),
  GEMINI_MODEL_PRO: z.string().default('gemini-1.5-pro'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((v) => parseInt(v, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables configuration:', parsed.error.format());
  throw new Error('Environment variable validation failed');
}

export const env = parsed.data;
