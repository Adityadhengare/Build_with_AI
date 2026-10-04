'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  FileCheck, 
  ExternalLink, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { applicationsApi } from '@/lib/api/applications';
import { ApplicationRecord, ApplicationStatus } from '@/types/application';
import { formatDate } from '@/lib/utils';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<ApplicationRecord | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('APPLIED');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    async function loadApps() {
      setIsLoading(true);
      const data = await applicationsApi.getApplications();
      setApplications(data);
      setIsLoading(false);
    }
    loadApps();
  }, []);

  const handleOpenEdit = (app: ApplicationRecord) => {
    setEditingApp(app);
    setNewStatus(app.status);
    setNewNotes(app.notes || '');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    const updated = await applicationsApi.updateApplicationStatus(
      editingApp.id,
      newStatus,
      newNotes
    );

    if (updated) {
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    }
    setEditingApp(null);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selected / Disbursed
          </span>
        );
      case 'APPLIED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#EFF4FF] text-[#1E3A8A] border border-[#BFDBFE] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Applied on Official Portal
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Under Nodal Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> In Progress (Draft)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Not Shortlisted
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
            Saved Scheme
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">
            Scholarship Application Tracker
          </h1>
          <p className="text-xs md:text-sm text-[#475569] mt-1">
            Keep track of submissions, official acknowledgement numbers, and nodal review statuses.
          </p>
        </div>

        <Link href="/scholarships">
          <Button variant="primary" size="md" className="flex items-center gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>Track New Application</span>
          </Button>
        </Link>
      </div>

      {/* Applications Table / Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center">
            <FileCheck className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0F294A]">No applications tracked yet</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
              When you apply on an official portal like MahaDBT or NSP, log your reference ID here to track milestones.
            </p>
            <Link href="/scholarships">
              <Button variant="primary" size="sm">
                Explore Scholarships
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 md:p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-[#CBD5E1] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        {app.providerName}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">•</span>
                      <span className="text-[11px] text-[#64748B]">{app.providerType}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-[#0F294A] leading-snug">
                      {app.scholarshipTitle}
                    </h3>
                  </div>

                  <div className="shrink-0">{getStatusBadge(app.status)}</div>
                </div>

                {/* Key Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg text-xs">
                  {app.officialApplicationId && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">Official Application Ref</span>
                      <span className="font-mono font-bold text-[#0F294A]">{app.officialApplicationId}</span>
                    </div>
                  )}
                  {app.appliedDate && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">Submission Date</span>
                      <span className="font-semibold text-[#0F294A]">{formatDate(app.appliedDate)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Estimated Grant</span>
                    <span className="font-bold text-[#15803D]">{app.estimatedAmount}</span>
                  </div>
                </div>

                {/* Notes & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] text-xs">
                  <p className="text-[#475569] italic text-xs max-w-xl">
                    {app.notes ? `Note: ${app.notes}` : 'No notes added for this application.'}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(app)}
                      className="gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </Button>
                    <a
                      href={app.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#475569] hover:text-[#0F294A] rounded hover:bg-[#F1F5F9]"
                      title="Open Official Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Application Modal */}
      {editingApp && (
        <Modal
          isOpen={!!editingApp}
          onClose={() => setEditingApp(null)}
          title="Update Application Status"
          description={editingApp.scholarshipTitle}
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
                Current Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="h-10 w-full rounded border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
              >
                <option value="SAVED">Saved</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="APPLIED">Applied on Official Portal</option>
                <option value="UNDER_REVIEW">Under Nodal Officer Review</option>
                <option value="SELECTED">Selected / Grant Disbursed</option>
                <option value="REJECTED">Rejected / Not Shortlisted</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
                Personal Progress Notes
              </label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Scrutiny cleared by college; forwarded to state nodal desk..."
                className="w-full p-2.5 text-xs text-[#0F294A] rounded border border-[#CBD5E1] focus:outline-none focus:border-[#0F294A]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingApp(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Updates
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
