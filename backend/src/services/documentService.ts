import crypto from 'crypto';
import { getFirebaseStorage, isUsingMockFirebase } from '../config/firebase';
import { dbService } from './db';
import { geminiService } from './geminiService';
import { validateFileMagicBytes, generateSafeStoragePath, calculateProfileCompleteness } from '../utils/helpers';
import { UnsupportedMediaTypeError, PayloadTooLargeError, NotFoundError } from '../utils/errors';
import { StudentDocument, DocumentType, DocumentStatus } from '../types';
import { logger } from '../utils/logger';

export class DocumentService {
  /**
   * Secure upload pipeline: magic-byte validation, storage upload, Gemini extraction & persistence
   */
  public async uploadAndProcessDocument(
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    declaredMimeType: string,
    documentType: DocumentType
  ): Promise<StudentDocument> {
    // 1. Enforce size limit (5MB = 5,242,880 bytes)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      throw new PayloadTooLargeError('File size exceeds the 5MB maximum limit.');
    }

    // 2. Inspect magic bytes (disregard client-declared extension/MIME)
    const { isValid, detectedMime } = validateFileMagicBytes(fileBuffer);
    if (!isValid) {
      throw new UnsupportedMediaTypeError('Only genuine PDF, JPEG, and PNG files are accepted.');
    }

    const mime = detectedMime || declaredMimeType;
    const { storagePath, safeFileName } = generateSafeStoragePath(userId, originalName);

    // 3. Upload to Firebase Storage (if available)
    let downloadUrl: string | undefined;
    if (!isUsingMockFirebase()) {
      try {
        const storage = getFirebaseStorage();
        if (storage) {
          const bucket = storage.bucket();
          const file = bucket.file(storagePath);
          await file.save(fileBuffer, {
            metadata: {
              contentType: mime,
              metadata: {
                ownerUserId: userId,
                originalFileName: originalName,
              },
            },
          });
          // Generate 15-minute temporary read URL
          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000,
          });
          downloadUrl = signedUrl;
        }
      } catch (err) {
        logger.warn('Could not upload to live Firebase Storage, continuing with record creation', {
          error: (err as Error).message,
        });
      }
    }

    const docId = `doc_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // 4. Trigger server-side Gemini Document Extraction
    const extraction = await geminiService.extractDocumentData(fileBuffer, mime, documentType);

    // 5. Determine status: if confidence < 0.70 or illegible, mark as NEEDS_REVIEW
    let status: DocumentStatus = 'EXTRACTED';
    let authorityBadge: string | undefined = 'Extracted by Gemini AI';

    if (!extraction.isDocumentLegible || extraction.confidenceScore < 0.70) {
      status = 'NEEDS_REVIEW';
      authorityBadge = 'Needs Manual Verification';
    } else if (extraction.confidenceScore >= 0.90) {
      status = 'VERIFIED';
      authorityBadge = 'AI Extracted & Form Verified';
    }

    const newDoc: StudentDocument = {
      id: docId,
      userId,
      documentType,
      title: originalName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      fileName: safeFileName,
      fileSizeBytes: fileBuffer.length,
      mimeType: mime,
      storagePath,
      status,
      uploadedAt: now,
      updatedAt: now,
      extraction,
      authorityBadge,
      downloadUrl,
    };

    // 6. Save in Firestore
    await dbService.saveDocument(userId, newDoc);

    // 7. Auto-update Profile completeness & create notification
    const docs = await dbService.getDocuments(userId);
    const verifiedCount = docs.filter((d) => d.status === 'VERIFIED').length;
    const profile = await dbService.getProfile(userId);
    if (profile) {
      const completeness = calculateProfileCompleteness(profile, verifiedCount);
      profile.profileCompleteness = completeness;
      await dbService.saveProfile(userId, profile);
    }

    await dbService.saveNotification(userId, {
      id: `notif_${crypto.randomUUID()}`,
      userId,
      title: 'Document Analysis Ready',
      message: `Gemini has completed processing your ${documentType.replace(/_/g, ' ')}. Status: ${status}.`,
      type: 'DOCUMENT_ALERT',
      timestamp: now,
      isRead: false,
      linkUrl: '/documents',
    });

    return newDoc;
  }

  /**
   * Student confirms or manually edits extracted fields to update profile attributes
   */
  public async verifyAndConfirmDocument(
    userId: string,
    docId: string,
    corrections?: {
      confirmedIncome?: number;
      confirmedCategory?: string;
      confirmedPercentage?: number;
      confirmedState?: string;
    }
  ): Promise<StudentDocument> {
    const doc = await dbService.getDocumentById(userId, docId);
    if (!doc) {
      throw new NotFoundError('Document not found in your vault.');
    }

    doc.status = 'VERIFIED';
    doc.updatedAt = new Date().toISOString();
    doc.authorityBadge = 'Student Verified';

    // If corrections provided, apply to extraction and update student profile
    const profile = await dbService.getProfile(userId);

    if (profile) {
      if (corrections?.confirmedIncome !== undefined) {
        profile.familyAnnualIncome = corrections.confirmedIncome;
      } else if (doc.extraction?.annualIncome !== null && doc.extraction?.annualIncome !== undefined) {
        profile.familyAnnualIncome = doc.extraction.annualIncome;
      }

      if (corrections?.confirmedCategory) {
        profile.category = corrections.confirmedCategory as any;
      } else if (doc.extraction?.casteCategory) {
        profile.category = doc.extraction.casteCategory as any;
      }

      if (corrections?.confirmedPercentage !== undefined && profile.education) {
        profile.education.percentageOrCgpa = corrections.confirmedPercentage;
      } else if (doc.extraction?.percentage !== null && doc.extraction?.percentage !== undefined && profile.education) {
        profile.education.percentageOrCgpa = doc.extraction.percentage;
      }

      if (corrections?.confirmedState) {
        profile.domicileState = corrections.confirmedState;
      }

      const allDocs = await dbService.getDocuments(userId);
      const verifiedCount = allDocs.filter((d) => d.status === 'VERIFIED' || d.id === docId).length;
      profile.profileCompleteness = calculateProfileCompleteness(profile, verifiedCount);

      await dbService.saveProfile(userId, profile);
    }

    await dbService.saveDocument(userId, doc);
    return doc;
  }
}

export const documentService = new DocumentService();
