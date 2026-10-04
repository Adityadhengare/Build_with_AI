'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck
} from 'lucide-react';
import { assistantApi, AssistantMessage } from '@/lib/api/assistant';
import { FormattedMessage } from '@/components/ui/formatted-message';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { user, profile } = useAuth();

  const studentName = profile?.fullName || user?.displayName || 'there';

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: `Hello ${studentName}! I am your **ScholarSathi AI Assistant**.\n\nI am grounded strictly in official government regulations (NSP, MahaDBT, SSP Karnataka) and your student profile.\n\nHow can I help you today? You can ask about eligibility rules, required certificates, or upcoming deadlines.`,
      timestamp: 'Just now',
      toolsUsed: ['getStudentProfile'],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const submitMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await assistantApi.sendMessage(query);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      console.error('AI Assistant chat error:', err);
      const errorMessage = err?.message || 'I encountered a temporary connection issue. Please try asking again.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: errorMessage,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      const timer = setTimeout(() => {
        submitMessage(initialQuery);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialQuery, submitMessage]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!textToSend) setInput('');
    submitMessage(query);
  };

  const suggestedPrompts = [
    { label: 'Find scholarships for my profile', query: 'Find scholarships for my profile' },
    { label: 'Why am I eligible for MahaDBT?', query: 'Why am I eligible for this scholarship?' },
    { label: 'What documents do I need to prepare?', query: 'What documents do I need?' },
    { label: 'Which scholarships are closing soon?', query: 'Which scholarships are closing soon?' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0F294A] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#86EFAC]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#0F294A]">ScholarSathi AI Assistant</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                Rule Grounded
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Deterministic rule assistance powered by Gemini &amp; your student profile
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#475569] font-medium bg-[#F8FAFC] px-3 py-1.5 rounded border border-[#E2E8F0]">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span>Zero Hallucinations Guarantee</span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-xs font-bold text-[#64748B] uppercase shrink-0">Suggestions:</span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="text-xs font-semibold text-[#0F294A] bg-white border border-[#CBD5E1] px-3 py-1.5 rounded hover:bg-[#EFF4FF] hover:border-[#0F294A] whitespace-nowrap transition-colors cursor-pointer shadow-xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-4 md:p-6 overflow-y-auto space-y-5 shadow-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-[#0F294A] text-white'
                  : 'bg-[#EFF4FF] text-[#0F294A] border border-[#CBD5E1]'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#1D4ED8]" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-2xl flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : ''}`}>
              <div
                className={`p-4 rounded-xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0F294A] text-white'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0B1C30]'
                }`}
              >
                {/* Message Body with Markdown formatting support */}
                <FormattedMessage content={msg.content} isUser={msg.sender === 'user'} />

                {/* Tool Calling Chips (if assistant) */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B]">
                    <span className="font-semibold text-[#0F294A]">Backend Tools:</span>
                    {msg.toolsUsed.map((t, i) => (
                      <span key={i} className="bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded font-mono text-[10px]">
                        ✓ {t}()
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Embedded Scholarship Cards inside Assistant Response (CRITICAL REQUIREMENT) */}
              {msg.suggestedCards && msg.suggestedCards.length > 0 && (
                <div className="w-full space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Recommended Scheme Cards:
                  </span>
                  {msg.suggestedCards.map((sch) => (
                    <div key={sch.id} className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#15803D] uppercase bg-[#DCFCE7] px-1.5 py-0.5 rounded border border-[#86EFAC]">
                            {sch.matchScore}% Match
                          </span>
                          <h4 className="text-sm font-bold text-[#0F294A] mt-1">{sch.title}</h4>
                          <p className="text-xs text-[#64748B]">{sch.financialAssistance}</p>
                        </div>
                        <Link href={`/scholarships/${sch.id}`}>
                          <Button variant="primary" size="sm">
                            View Details →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-[#94A3B8] px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EFF4FF] text-[#0F294A] border border-[#CBD5E1] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-3 rounded-xl flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#0F294A] animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-[#0F294A] animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-[#0F294A] animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs text-[#64748B] ml-2">Evaluating official criteria...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white border border-[#E2E8F0] p-2 rounded-xl shadow-xs shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about eligibility, income certificates, or schemes..."
          className="flex-1 px-3 py-2 text-sm text-[#0F294A] placeholder:text-[#94A3B8] focus:outline-none"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || isTyping}
          className="gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748B]">Loading assistant...</div>}>
        <AssistantContent />
      </Suspense>
    </ProtectedRoute>
  );
}
