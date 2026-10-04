import { StudentDocument, DocumentType } from '@/types/document';
import { MOCK_DOCUMENTS } from '@/lib/mock/documents';

export const documentsApi = {
  async getDocuments(): Promise<StudentDocument[]> {
    // Simulates TRD GET /api/documents
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...MOCK_DOCUMENTS];
  },

  async uploadDocument(file: File, documentType: DocumentType): Promise<StudentDocument> {
    // Simulates TRD POST /api/documents/upload & server-side Gemini extraction
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}`,
      documentType,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      fileName: file.name,
      fileSizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'VERIFIED',
      authorityBadge: 'AI Extracted & Form Validation Verified',
      extraction: {
        annualIncome: documentType === 'INCOME_CERTIFICATE' ? 235000 : undefined,
        financialYear: documentType === 'INCOME_CERTIFICATE' ? '2026-27' : undefined,
        confidenceScore: 0.95,
      }
    };
    return newDoc;
  },

  async verifyDocument(_id: string, _correctedValues?: Record<string, unknown>): Promise<boolean> {
    void _id;
    void _correctedValues;
    // Simulates TRD POST /api/documents/:id/verify
    await new Promise((resolve) => setTimeout(resolve, 150));
    return true;
  },

  async deleteDocument(_id: string): Promise<boolean> {
    void _id;
    // Simulates TRD DELETE /api/documents/:id
    await new Promise((resolve) => setTimeout(resolve, 150));
    return true;
  }
};
