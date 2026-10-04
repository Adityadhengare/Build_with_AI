import { describe, it, expect } from 'vitest';
import { DocumentExtractionSchema, GeminiService } from '../src/services/geminiService';

describe('Gemini Document Extraction & AI Security', () => {
  const geminiService = new GeminiService();

  it('19. Gemini response validation: should parse and validate valid structured extraction JSON', () => {
    const validJson = {
      documentType: 'INCOME_CERTIFICATE',
      extractedStudentName: 'Aditya Ramesh Patil',
      issuingState: 'Maharashtra',
      issuingAuthority: 'Tahsildar Haveli',
      certificateNumber: 'MH-INC-2026-98124',
      annualIncome: 235000,
      financialYear: '2026-27',
      casteCategory: 'OBC',
      percentage: 78.4,
      confidenceScore: 0.95,
      isDocumentLegible: true,
      notesOrAnomalies: null,
    };

    const parsed = DocumentExtractionSchema.parse(validJson);
    expect(parsed.documentType).toBe('INCOME_CERTIFICATE');
    expect(parsed.annualIncome).toBe(235000);
    expect(parsed.confidenceScore).toBe(0.95);
    expect(parsed.casteCategory).toBe('OBC');
  });

  it('should reject invalid / negative income and invalid confidence bounds in extraction schema', () => {
    const invalidIncomeJson = {
      documentType: 'INCOME_CERTIFICATE',
      annualIncome: -50000, // Invalid: negative
      confidenceScore: 1.5, // Invalid: > 1.0
      isDocumentLegible: true,
    };

    expect(() => DocumentExtractionSchema.parse(invalidIncomeJson)).toThrow();
  });

  it('should handle simulated document extraction safely in offline / test mode', async () => {
    const fakeBuffer = Buffer.from('%PDF-1.4 mock pdf content');
    const result = await geminiService.extractDocumentData(fakeBuffer, 'application/pdf', 'INCOME_CERTIFICATE');

    expect(result.documentType).toBe('INCOME_CERTIFICATE');
    expect(result.annualIncome).toBe(235000);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.8);
    expect(result.isDocumentLegible).toBe(true);
  });
});
