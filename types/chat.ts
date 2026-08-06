import type { AiExtractedTransaction } from './transaction';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  extractedTransaction?: AiExtractedTransaction;
  modelUsed?: 'gemini-3.6-flash' | 'gemini-3.5-flash-lite';
}

export interface AiResponsePayload {
  text: string;
  transaction?: AiExtractedTransaction;
  modelUsed: 'gemini-3.6-flash' | 'gemini-3.5-flash-lite';
  confidence?: number;
}

export interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
  userId: string;
}
