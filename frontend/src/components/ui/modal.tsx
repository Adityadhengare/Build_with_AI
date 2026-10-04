'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1C30]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-[#E2E8F0] animate-in fade-in-0 zoom-in-95',
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-[#0F294A]">
              {title}
            </h3>
            {description && <p className="text-xs text-[#64748B] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F294A] transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}
