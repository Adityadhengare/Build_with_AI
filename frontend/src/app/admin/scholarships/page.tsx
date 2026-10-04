'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/layout/admin-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Search, 
  ShieldCheck
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Scholarship, ProviderType } from '@/types/scholarship';
import { formatDate } from '@/lib/utils';

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);

  // Form states for creating / editing
  const [formData, setFormData] = useState({
    title: '',
    providerName: '',
    providerType: 'GOVERNMENT_STATE',
    state: 'Maharashtra',
    description: '',
    financialAssistance: '',
    deadline: '2026-11-30',
    officialPortalUrl: '',
    incomeCap: '250000',
    minMarks: '60.0',
    allowedCategories: 'OBC, SC, ST, EWS',
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await adminApi.getAllScholarships();
      setScholarships(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingScholarship(null);
    setFormData({
      title: '',
      providerName: '',
      providerType: 'GOVERNMENT_STATE',
      state: 'Maharashtra',
      description: '',
      financialAssistance: '₹50,000 / year',
      deadline: '2026-11-30',
      officialPortalUrl: 'https://scholarships.gov.in',
      incomeCap: '250000',
      minMarks: '60.0',
      allowedCategories: 'OBC, SC, ST, EWS',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: Scholarship) => {
    setEditingScholarship(sch);
    setFormData({
      title: sch.title,
      providerName: sch.provider.name,
      providerType: sch.provider.type,
      state: sch.provider.state || 'All India',
      description: sch.description,
      financialAssistance: sch.financialAssistance,
      deadline: sch.applicationDeadline.split('T')[0],
      officialPortalUrl: sch.officialPortalUrl,
      incomeCap: '250000',
      minMarks: '60.0',
      allowedCategories: 'OBC, SC, ST, EWS',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to archive this scholarship scheme?')) {
      await adminApi.deleteScholarship(id);
      setScholarships((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScholarship) {
      const updated = await adminApi.updateScholarship(editingScholarship.id, {
        title: formData.title,
        description: formData.description,
        financialAssistance: formData.financialAssistance,
        officialPortalUrl: formData.officialPortalUrl,
        applicationDeadline: `${formData.deadline}T23:59:59Z`,
      });
      if (updated) {
        setScholarships((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      }
    } else {
      const created = await adminApi.createScholarship({
        title: formData.title,
        description: formData.description,
        financialAssistance: formData.financialAssistance,
        officialPortalUrl: formData.officialPortalUrl,
        applicationDeadline: `${formData.deadline}T23:59:59Z`,
        provider: {
          name: formData.providerName,
          type: formData.providerType as ProviderType,
          websiteUrl: formData.officialPortalUrl,
          state: formData.state,
        },
      });
      setScholarships((prev) => [created, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filtered = scholarships.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.provider.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">
              Scholarship Scheme Management
            </h1>
            <p className="text-xs md:text-sm text-[#475569] mt-0.5">
              Configure machine-readable eligibility criteria, verified official URLs, and deadlines.
            </p>
          </div>

          <Button variant="primary" size="md" onClick={handleOpenCreate} className="gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>Add New Scheme</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog schemes by title or authority..."
              className="h-10 w-full pl-10 pr-4 rounded-lg border border-[#CBD5E1] bg-white text-xs md:text-sm text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
            />
          </div>
        </div>

        {/* Scholarships Data Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2E8F0] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Scheme Title &amp; Provider</th>
                  <th className="py-3 px-4">Provider Type</th>
                  <th className="py-3 px-4">Grant Assistance</th>
                  <th className="py-3 px-4">Application Window</th>
                  <th className="py-3 px-4">Official Portal</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      Loading catalog schemes...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      No scholarships match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sch) => (
                    <tr key={sch.id} className="hover:bg-[#F8F9FF] transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-[#0F294A] block truncate">{sch.title}</span>
                        <span className="text-[11px] text-[#64748B] block truncate">{sch.provider.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#334155]">
                        {sch.provider.type}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#15803D]">
                        {sch.financialAssistance}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        Closes {formatDate(sch.applicationDeadline)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <a
                          href={sch.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1D4ED8] hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{sch.officialPortalUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(sch)}
                          className="p-1.5 text-[#475569] hover:text-[#0F294A] rounded hover:bg-[#F1F5F9] cursor-pointer"
                          title="Edit Criteria"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sch.id)}
                          className="p-1.5 text-[#B91C1C] hover:text-[#991B1B] rounded hover:bg-[#FEE2E2] cursor-pointer"
                          title="Archive Scheme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Scholarship Modal with Rule Builder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingScholarship ? 'Edit Scholarship Scheme & Criteria' : 'Add New Verified Scholarship'}
        description="Structured rules are evaluated mathematically by the deterministic engine."
        className="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <Input
            label="Scheme Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Provider Authority / Ministry"
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              required
            />
            <Select
              label="Provider Classification"
              value={formData.providerType}
              onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
              options={[
                { value: 'GOVERNMENT_STATE', label: 'State Government DBT' },
                { value: 'GOVERNMENT_CENTRAL', label: 'Central Government (NSP)' },
                { value: 'CORPORATE_CSR', label: 'Corporate CSR Grant' },
                { value: 'PRIVATE_TRUST', label: 'Private Philanthropic Trust' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Annual Financial Assistance"
              value={formData.financialAssistance}
              onChange={(e) => setFormData({ ...formData, financialAssistance: e.target.value })}
              placeholder="e.g. ₹50,000 / year"
              required
            />
            <Input
              label="Application Closing Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <Input
            label="Official Application Website URL (Verified Domain)"
            type="url"
            value={formData.officialPortalUrl}
            onChange={(e) => setFormData({ ...formData, officialPortalUrl: e.target.value })}
            placeholder="https://mahadbt.maharashtra.gov.in"
            helperText="Must be the sovereign government or official foundation portal."
            required
          />

          {/* Machine-Readable Structured Rule Builder Section */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-[#0F294A]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>Machine-Readable Eligibility Rules (Deterministic Engine)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Maximum Family Income Cap (₹)"
                type="number"
                value={formData.incomeCap}
                onChange={(e) => setFormData({ ...formData, incomeCap: e.target.value })}
              />
              <Input
                label="Minimum Academic Cutoff (%)"
                type="number"
                step="0.1"
                value={formData.minMarks}
                onChange={(e) => setFormData({ ...formData, minMarks: e.target.value })}
              />
            </div>

            <Input
              label="Allowed Categories (Comma Separated)"
              value={formData.allowedCategories}
              onChange={(e) => setFormData({ ...formData, allowedCategories: e.target.value })}
              placeholder="OBC, SC, ST, EWS, GENERAL"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider block mb-1">
              Scheme Description &amp; Scope
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-xs text-[#0F294A] rounded border border-[#CBD5E1] focus:outline-none focus:border-[#0F294A]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingScholarship ? 'Update Scheme' : 'Publish Scheme to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
