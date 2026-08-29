import type { AiExtractedTransaction } from './transaction';

export type MessageRole = 'user' | 'assistant';

export interface AiTransactionAction {
  action: 'UPDATE' | 'DELETE';
  id: string;
  amount?: number;
  category?: string;
  description?: string;
  type?: 'INCOME' | 'EXPENSE';
  date?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  extractedTransaction?: AiExtractedTransaction;
  extractedTransactions?: AiExtractedTransaction[];
  actions?: AiTransactionAction[];
  modelUsed?: 'gemini-3.6-flash' | 'gemini-3.5-flash-lite';
}

export interface AiResponsePayload {
  text: string;
  transaction?: AiExtractedTransaction;
  transactions?: AiExtractedTransaction[];
  actions?: AiTransactionAction[];
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
