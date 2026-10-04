import crypto from 'crypto';
import { StudentProfile } from '../types';

/**
 * Validates file magic bytes to verify genuine PDF, JPEG, or PNG format
 */
export function validateFileMagicBytes(buffer: Buffer): { isValid: boolean; detectedMime?: string } {
  if (!buffer || buffer.length < 4) {
    return { isValid: false };
  }

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { isValid: true, detectedMime: 'application/pdf' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedMime: 'image/png' };
  }

  return { isValid: false };
}

/**
 * Generates a safe, non-guessable, sanitized storage path
 */
export function generateSafeStoragePath(userId: string, originalFileName: string): { storagePath: string; safeFileName: string } {
  const fileExt = originalFileName.includes('.')
    ? originalFileName.slice(originalFileName.lastIndexOf('.')).toLowerCase()
    : '.bin';
  
  // Strip any directory traversal or malicious characters from extension
  const cleanExt = fileExt.replace(/[^a-z0-9.]/g, '');
  const uniqueId = crypto.randomUUID();
  const safeFileName = `${uniqueId}${cleanExt}`;
  const storagePath = `users/${userId}/documents/${uniqueId}/${safeFileName}`;

  return { storagePath, safeFileName };
}

/**
 * Computes profile completeness (0-100%) based on filled fields
 */
export function calculateProfileCompleteness(profile: Partial<StudentProfile>, verifiedDocsCount = 0): number {
  let score = 0;

  // Personal Information (Max 40 points)
  if (profile.fullName) score += 6;
  if (profile.dob) score += 6;
  if (profile.gender) score += 6;
  if (profile.domicileState) score += 8;
  if (profile.domicileDistrict) score += 4;
  if (profile.category) score += 5;
  if (typeof profile.familyAnnualIncome === 'number') score += 5;

  // Education Profile (Max 40 points)
  if (profile.education) {
    const edu = profile.education;
    if (edu.currentEducationLevel) score += 10;
    if (edu.courseName) score += 10;
    if (edu.institutionName) score += 10;
    if (typeof edu.percentageOrCgpa === 'number' && edu.percentageOrCgpa > 0) score += 10;
  }

  // Documents Verified (Max 20 points)
  if (verifiedDocsCount > 0) {
    score += Math.min(20, verifiedDocsCount * 10);
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Formats amount in INR e.g. ₹50,000 / year
 */
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
