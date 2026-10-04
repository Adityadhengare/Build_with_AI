import { Scholarship } from '@/types/scholarship';
import { MOCK_SCHOLARSHIPS } from '@/lib/mock/scholarships';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedCards?: Scholarship[];
  toolsUsed?: string[];
}

export const assistantApi = {
  async sendMessage(query: string, _scholarshipId?: string): Promise<AssistantMessage> {
    void _scholarshipId;
    // Simulates TRD POST /api/ai/chat with server-side Gemini tool calling
    await new Promise((resolve) => setTimeout(resolve, 600));

    const q = query.toLowerCase();

    if (q.includes('document') || q.includes('documents') || q.includes('income certificate')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Based on your profile (OBC, Maharashtra domicile, B.Tech 3rd year), the key documents you need for most government and private scholarships are:\n\n1. **Tehsildar Family Income Certificate** (Valid for AY 2026-27, issued by Taluka Executive Magistrate)\n2. **Caste Certificate & Validity Certificate** (Issued by Divisional Caste Scrutiny Committee)\n3. **Certificate of Age, Nationality & Domicile** (Maharashtra State)\n4. **Class 12th & Semester Marksheets**\n5. **Current College Bonafide Certificate**\n\nYour profile currently has 4 verified documents in your vault. Your Bonafide Certificate is pending verification.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsUsed: ['getRequiredDocuments', 'getStudentProfile'],
      };
    }

    if (q.includes('closing') || q.includes('soon') || q.includes('deadline')) {
      const closingSoon = MOCK_SCHOLARSHIPS.filter((s) => s.id === 'sch-tata-trusts-engg' || s.id === 'sch-mahadbt-ebc');
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Here are the active scholarships closing soon that match your profile. The **Tata Trusts Undergraduate Scholarship** closes in 21 days (25 October 2026), and the **Maharashtra MahaDBT Post-Matric Scheme** closes on 31 October 2026.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedCards: closingSoon,
        toolsUsed: ['searchScholarships', 'checkEligibility'],
      };
    }

    if (q.includes('why') && (q.includes('eligible') || q.includes('not eligible'))) {
      const topMatch = MOCK_SCHOLARSHIPS[0];
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `You are **94% eligible** for the **Rajarshi Chhatrapati Shahu Maharaj Yojna (MahaDBT)** because:\n\n- ✓ **Domicile Match:** Your permanent domicile is Maharashtra.\n- ✓ **Category Match:** You belong to OBC (Non-Creamy Layer).\n- ✓ **Income Cap:** Your family annual income of ₹2,35,000 is well within the ₹8,00,000 ceiling.\n- ✓ **Academic Threshold:** Your 78.4% score exceeds the 50% cutoff for professional engineering degrees.\n\nAll primary documents required for this scheme are verified in your vault. You can apply directly on the official MahaDBT portal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedCards: [topMatch],
        toolsUsed: ['checkEligibility', 'getScholarshipDetails'],
      };
    }

    // Default response: recommend scholarships
    const eligibleMatches = MOCK_SCHOLARSHIPS.filter((s) => s.matchStatus === 'ELIGIBLE' || s.matchStatus === 'LIKELY_ELIGIBLE').slice(0, 3);
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      content: `Based on your profile as a **B.Tech 3rd Year OBC student from Maharashtra with ₹2.35L family income**, I found **${eligibleMatches.length} highly relevant scholarships** that you qualify for. You can review the criteria breakdown and click to apply on the official government and trust portals:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedCards: eligibleMatches,
      toolsUsed: ['searchScholarships', 'checkEligibility'],
    };
  }
};
