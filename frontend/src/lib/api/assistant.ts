import { Scholarship } from '@/types/scholarship';
import { apiClient } from './client';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedCards?: Scholarship[];
  toolsUsed?: string[];
}

export const assistantApi = {
  async sendMessage(query: string, scholarshipId?: string): Promise<AssistantMessage> {
    const res = await apiClient<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: query,
        scholarshipId,
      }),
    });

    return {
      id: res.id || `msg-${Date.now()}`,
      sender: 'assistant',
      content: res.content || res.reply || 'Here is the information from ScholarSathi.',
      timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedCards: res.suggestedCards,
      toolsUsed: res.toolsUsed,
    };
  },
};
