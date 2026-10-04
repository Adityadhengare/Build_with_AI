import { StudentDocument, DocumentType } from '@/types/document';
import { apiClient } from './client';

export const documentsApi = {
  async getDocuments(): Promise<StudentDocument[]> {
    return await apiClient<StudentDocument[]>('/documents');
  },

  async uploadDocument(file: File, documentType: DocumentType): Promise<StudentDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const result = await apiClient<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });

    return {
      id: result.documentId || result.id || `doc-${Date.now()}`,
      documentType: result.documentType || documentType,
      title: result.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      fileName: result.fileName || file.name,
      fileSizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      status: result.status || 'VERIFIED',
      authorityBadge: result.authorityBadge || 'AI Extracted & Form Validation Verified',
      extraction: result.extraction,
    };
  },

  async verifyDocument(id: string, correctedValues?: Record<string, unknown>): Promise<boolean> {
    await apiClient(`/documents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(correctedValues || {}),
    });
    return true;
  },

  async deleteDocument(id: string): Promise<boolean> {
    await apiClient(`/documents/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};
