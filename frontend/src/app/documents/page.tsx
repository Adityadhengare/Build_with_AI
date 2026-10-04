'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  Eye, 
  ShieldCheck
} from 'lucide-react';
import { documentsApi } from '@/lib/api/documents';
import { StudentDocument, DocumentType } from '@/types/document';
import { formatDate, formatINR } from '@/lib/utils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<StudentDocument | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('INCOME_CERTIFICATE');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  useEffect(() => {
    async function loadDocs() {
      setIsLoading(true);
      const data = await documentsApi.getDocuments();
      setDocuments(data);
      setIsLoading(false);
    }
    loadDocs();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setIsUploading(true);
    const newDoc = await documentsApi.uploadDocument(fileToUpload, selectedDocType);
    setDocuments((prev) => [newDoc, ...prev]);
    setIsUploading(false);
    setUploadModalOpen(false);
    setFileToUpload(null);
  };

  const handleDelete = async (id: string) => {
    await documentsApi.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Title & Upload Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">
              My Documents &amp; Verification Vault
            </h1>
            <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
              Encrypted
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#475569] mt-1">
            Certificates are scanned server-side to extract structured eligibility parameters.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Certificate</span>
        </Button>
      </div>

      {/* Quick Verification Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase">Total Uploads</span>
            <span className="text-2xl font-bold text-[#0F294A] block mt-0.5">{documents.length}</span>
          </div>
          <div className="w-10 h-10 rounded bg-[#EFF4FF] flex items-center justify-center text-[#0F294A]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#15803D] uppercase">Verified by AI &amp; Seal</span>
            <span className="text-2xl font-bold text-[#15803D] block mt-0.5">
              {documents.filter((d) => d.status === 'VERIFIED').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#B45309] uppercase">Pending / Review</span>
            <span className="text-2xl font-bold text-[#B45309] block mt-0.5">
              {documents.filter((d) => d.status !== 'VERIFIED').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#0F294A]">Uploaded Certificates</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center">
            <UploadCloud className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0F294A]">No documents uploaded yet</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
              Upload your family income certificate or caste certificate to enable automated eligibility confirmation.
            </p>
            <Button variant="primary" size="sm" onClick={() => setUploadModalOpen(true)}>
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-[#CBD5E1] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#EFF4FF] flex items-center justify-center text-[#0F294A]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F294A] leading-snug">{doc.title}</h3>
                        <span className="text-[11px] text-[#64748B]">{doc.fileName}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {doc.status === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {doc.status === 'NEEDS_REVIEW' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Needs Review
                      </span>
                    )}
                    {doc.status === 'PROCESSING' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFF4FF] text-[#1E3A8A] border border-[#BFDBFE] flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    )}
                  </div>

                  {/* Clean AI Extracted Information Display (STRICT REQUIREMENT) */}
                  {doc.extraction && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs space-y-1.5 mt-3">
                      <div className="flex items-center gap-1 font-bold text-[#0F294A] text-[11px] uppercase tracking-wider mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Extracted Certificate Attributes:</span>
                      </div>

                      {doc.extraction.annualIncome !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Annual Income:</span>
                          <span className="font-bold text-[#0F294A]">{formatINR(doc.extraction.annualIncome)}</span>
                        </div>
                      )}

                      {doc.extraction.financialYear && (
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Financial Year:</span>
                          <span className="font-semibold text-[#0F294A]">{doc.extraction.financialYear}</span>
                        </div>
                      )}

                      {doc.extraction.casteCategory && (
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Caste Category:</span>
                          <span className="font-semibold text-[#0F294A]">{doc.extraction.casteCategory}</span>
                        </div>
                      )}

                      {doc.extraction.percentage !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Aggregate Score:</span>
                          <span className="font-bold text-[#0F294A]">{doc.extraction.percentage}%</span>
                        </div>
                      )}

                      {doc.extraction.certificateNumber && (
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Certificate No:</span>
                          <span className="font-mono text-[10px] text-[#475569]">{doc.extraction.certificateNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[11px] text-[#94A3B8]">
                    Uploaded: {formatDate(doc.uploadedAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="text-xs font-semibold text-[#0F294A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Data
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs text-[#B91C1C] hover:text-[#991B1B] p-1 cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Student Certificate"
        description="Supported formats: PDF, JPEG, PNG (Max 5MB per file)."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
              Select Document Classification
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="h-10 w-full rounded border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
            >
              <option value="INCOME_CERTIFICATE">Family Income Certificate (Tehsildar)</option>
              <option value="CASTE_CERTIFICATE">Caste Certificate / Validity (OBC/SC/ST)</option>
              <option value="DOMICILE_CERTIFICATE">State Domicile Certificate</option>
              <option value="MARKSHEET_12TH">HSC / 12th Standard Marksheet</option>
              <option value="COLLEGE_MARKSHEET">Current Degree / Semester Grade Card</option>
              <option value="BONAFIDE_CERTIFICATE">College Bonafide Certificate</option>
              <option value="AADHAAR_CARD">Aadhaar Card (e-KYC Copy)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
              Certificate File
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
              required
              className="block w-full text-xs text-[#475569] file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0F294A] file:text-white hover:file:bg-[#1E3A8A] cursor-pointer"
            />
          </div>

          <div className="p-3 bg-[#EFF4FF] border border-[#CBD5E1] rounded text-[11px] text-[#475569] leading-relaxed">
            <p className="font-bold text-[#0F294A] mb-0.5">Automated Extraction:</p>
            Our server-side OCR extracts income amounts and dates automatically. You can confirm or edit the extracted values before they sync with your profile.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUploading}>
              Upload &amp; Extract Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Extraction Details Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={selectedDoc.title}
          description={`File: ${selectedDoc.fileName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Document Type:</span>
                <span className="font-bold text-[#0F294A]">{selectedDoc.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Verification Status:</span>
                <span className="font-bold text-[#15803D]">{selectedDoc.status}</span>
              </div>
              {selectedDoc.authorityBadge && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Issuing Authority:</span>
                  <span className="font-medium text-[#0F294A]">{selectedDoc.authorityBadge}</span>
                </div>
              )}
            </div>

            {selectedDoc.extraction && (
              <div className="p-3 bg-white border border-[#86EFAC] rounded space-y-2">
                <h4 className="font-bold text-[#0F294A] text-xs">Confirmed Extracted Fields:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedDoc.extraction.annualIncome && (
                    <div>
                      <span className="text-[#64748B] block text-[10px]">INCOME</span>
                      <span className="font-bold text-[#0F294A]">{formatINR(selectedDoc.extraction.annualIncome)}</span>
                    </div>
                  )}
                  {selectedDoc.extraction.financialYear && (
                    <div>
                      <span className="text-[#64748B] block text-[10px]">FINANCIAL YEAR</span>
                      <span className="font-bold text-[#0F294A]">{selectedDoc.extraction.financialYear}</span>
                    </div>
                  )}
                  {selectedDoc.extraction.casteCategory && (
                    <div>
                      <span className="text-[#64748B] block text-[10px]">CATEGORY</span>
                      <span className="font-bold text-[#0F294A]">{selectedDoc.extraction.casteCategory}</span>
                    </div>
                  )}
                  {selectedDoc.extraction.percentage && (
                    <div>
                      <span className="text-[#64748B] block text-[10px]">PERCENTAGE</span>
                      <span className="font-bold text-[#0F294A]">{selectedDoc.extraction.percentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
