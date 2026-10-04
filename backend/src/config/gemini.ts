import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';
import { logger } from '../utils/logger';

let geminiClient: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    logger.info('Gemini AI client initialized successfully on server');
  } catch (error) {
    logger.warn('Failed to initialize Gemini AI client:', { error: (error as Error).message });
  }
} else {
  logger.warn('GEMINI_API_KEY is not set. AI extraction and assistant will operate in simulated offline mode.');
}

export const getGeminiClient = (): GoogleGenerativeAI | null => geminiClient;
export const isGeminiConfigured = (): boolean => Boolean(env.GEMINI_API_KEY);
