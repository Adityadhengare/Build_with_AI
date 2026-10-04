'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Building2, 
  CheckCircle, 
  Coins, 
  Calendar, 
  ExternalLink,
  Info,
  GraduationCap
} from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

/**
 * Normalizes raw LLM output to ensure proper markdown parsing:
 * - Fixes single newlines before lists (* or -) so they become genuine HTML lists
 * - Normalizes headings followed immediately by bullets
 * - Strips any extraneous double-starred asterisks (* **)
 */
function normalizeContent(raw: string): string {
  if (!raw) return '';

  return raw
    // Ensure headings have space before bullets: "#### Title\n* bullet" -> "#### Title\n\n- bullet"
    .replace(/(#{1,6}[^\n]+)\n\s*[*•-]\s+/g, '$1\n\n- ')
    // Ensure lists preceded by normal text have an empty line: "text\n* bullet" -> "text\n\n- "
    .replace(/([^\n])\n\s*[*•-]\s+/g, '$1\n\n- ')
    // Replace standalone asterisks at line starts with clean hyphens for standard markdown list parsing
    .replace(/^\s*\*\s+/gm, '- ');
}

/**
 * Detects specific key-value label patterns like "Key Eligibility:", "Benefits:", "Deadline:", etc.
 * to render them with tailored iconography and clean pill badges.
 */
function renderStructuredListItem(children: React.ReactNode) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-[#334155] py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
      <div className="flex-1 space-y-0.5">{children}</div>
    </li>
  );
}

export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (isUser) {
    return <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>;
  }

  const cleanContent = normalizeContent(content);

  return (
    <div className="formatted-message space-y-3 text-sm text-[#1E293B] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="text-base md:text-lg font-bold text-[#0F294A] mt-4 mb-2 first:mt-0 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#2563EB] shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="text-base font-bold text-[#0F294A] mt-4 mb-2 first:mt-0 pb-1 border-b border-[#E2E8F0]">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <div className="mt-4 mb-2 first:mt-0 pt-3 border-t border-[#E2E8F0] first:border-t-0 first:pt-0">
              <h4 className="text-sm md:text-base font-bold text-[#0F294A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span>{children}</span>
              </h4>
            </div>
          ),
          h4: ({ children }) => (
            <div className="mt-4 mb-2 first:mt-0 pt-3 border-t border-[#E2E8F0] first:border-t-0 first:pt-0">
              <h4 className="text-sm font-bold text-[#0F294A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-[#1D4ED8]" />
                <span>{children}</span>
              </h4>
            </div>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-[#334155]">{children}</p>
          ),
          strong: ({ children }) => {
            const str = String(children).trim();
            // Highlight specific known tags with subtle badges
            if (/^(key eligibility|eligibility):?$/i.test(str)) {
              return (
                <span className="inline-flex items-center gap-1 font-semibold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded text-xs mr-1 border border-[#86EFAC]">
                  <CheckCircle className="w-3 h-3" />
                  {children}
                </span>
              );
            }
            if (/^(benefits?|financial assistance|scholarship amount):?$/i.test(str)) {
              return (
                <span className="inline-flex items-center gap-1 font-semibold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded text-xs mr-1 border border-[#FDE68A]">
                  <Coins className="w-3 h-3" />
                  {children}
                </span>
              );
            }
            if (/^(deadline|closing date|last date):?$/i.test(str)) {
              return (
                <span className="inline-flex items-center gap-1 font-semibold text-[#B91C1C] bg-[#FEE2E2] px-1.5 py-0.5 rounded text-xs mr-1 border border-[#FCA5A5]">
                  <Calendar className="w-3 h-3" />
                  {children}
                </span>
              );
            }
            if (/^(provider|offered by):?$/i.test(str)) {
              return (
                <span className="inline-flex items-center gap-1 font-semibold text-[#4338CA] bg-[#EEF2FF] px-1.5 py-0.5 rounded text-xs mr-1 border border-[#C7D2FE]">
                  <Building2 className="w-3 h-3" />
                  {children}
                </span>
              );
            }
            if (/^(note|important|next action):?$/i.test(str)) {
              return (
                <span className="inline-flex items-center gap-1 font-semibold text-[#0369A1] bg-[#E0F2FE] px-1.5 py-0.5 rounded text-xs mr-1 border border-[#BAE6FD]">
                  <Info className="w-3 h-3" />
                  {children}
                </span>
              );
            }
            return <strong className="font-semibold text-[#0F294A]">{children}</strong>;
          },
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2.5 pl-0 list-none">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2.5 pl-5 list-decimal marker:text-[#0F294A] marker:font-bold text-sm text-[#334155]">
              {children}
            </ol>
          ),
          li: ({ children }) => renderStructuredListItem(children),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] hover:text-[#1D4ED8] underline font-semibold inline-flex items-center gap-1"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ),
          blockquote: ({ children }) => (
            <div className="border-l-3 border-[#2563EB] bg-[#EFF6FF] p-3 rounded-r-lg text-xs md:text-sm text-[#1E3A8A] my-3">
              {children}
            </div>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-[#E2E8F0] rounded-lg shadow-2xs">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-xs text-left bg-white">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#F8FAFC]">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 font-bold text-[#0F294A] tracking-wider uppercase text-[11px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-[#E2E8F0] text-[#334155]">{children}</td>
          ),
          code: ({ children }) => (
            <code className="bg-[#F1F5F9] text-[#0F294A] font-mono text-xs px-1.5 py-0.5 rounded border border-[#E2E8F0]">
              {children}
            </code>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
