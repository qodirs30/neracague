import Dexie, { type Table } from 'dexie';
import type { Transaction, TransactionWithoutId } from '@/types/transaction';
import type { ChatMessage } from '@/types/chat';

export class NeracagueDB extends Dexie {
  transactions!: Table<Transaction>;
  chatMessages!: Table<ChatMessage>;

  constructor() {
    super('neracagueDB');
    this.version(1).stores({
      transactions: '++id, date, type, category, createdAt',
      chatMessages: '++id, createdAt, role',
    });
  }
}

export const db = new NeracagueDB();

// Transaction Operations
export async function addTransaction(
  transaction: TransactionWithoutId
): Promise<string> {
  const id = await db.transactions.add({
    ...transaction,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  });
  return id.toString();
}

export async function getTransactions(
  startDate?: string,
  endDate?: string,
  type?: 'INCOME' | 'EXPENSE',
  category?: string
): Promise<Transaction[]> {
  let query = db.transactions.toCollection();

  if (type) {
    query = query.filter((t) => t.type === type);
  }

  if (category) {
    query = query.filter((t) => t.category === category);
  }

  if (startDate) {
    query = query.filter((t) => t.date >= startDate);
  }

  if (endDate) {
    query = query.filter((t) => t.date <= endDate);
  }

  return query.reverse().toArray();
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<boolean> {
  const updatedCount = await db.transactions.update(id, updates);
  return updatedCount > 0;
}

export async function deleteTransaction(id: string): Promise<void> {
  return db.transactions.delete(id);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return db.transactions.toArray();
}

export async function clearAllTransactions(): Promise<void> {
  return db.transactions.clear();
}

// Chat Operations
export async function addChatMessage(message: ChatMessage): Promise<string> {
  const id = await db.chatMessages.add(message);
  return id.toString();
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  return db.chatMessages.orderBy('createdAt').toArray();
}

export async function clearChatMessages(): Promise<void> {
  return db.chatMessages.clear();
}

// Export/Import Operations
export async function exportData(): Promise<{
  transactions: Transaction[];
  chatMessages: ChatMessage[];
  exportedAt: string;
}> {
  const transactions = await db.transactions.toArray();
  const chatMessages = await db.chatMessages.toArray();

  return {
    transactions,
    chatMessages,
    exportedAt: new Date().toISOString(),
  };
}

export async function importData(data: {
  transactions?: Transaction[];
  chatMessages?: ChatMessage[];
}): Promise<{ imported: number }> {
  let count = 0;

  if (data.transactions && data.transactions.length > 0) {
    await db.transactions.bulkAdd(data.transactions, { allKeys: true });
    count += data.transactions.length;
  }

  if (data.chatMessages && data.chatMessages.length > 0) {
    await db.chatMessages.bulkAdd(data.chatMessages, { allKeys: true });
    count += data.chatMessages.length;
  }

  return { imported: count };
}

// Analytics Functions
export async function getMonthlyStats(date: string): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const startDate = date.split('-').slice(0, 2).join('-') + '-01';
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const endDate = nextMonth.toISOString().split('-').slice(0, 2).join('-') + '-01';

  const transactions = await getTransactions(startDate, endDate);

  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === 'INCOME') {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function getCategoryBreakdown(): Promise<
  { category: string; amount: number; percentage: number }[]
> {
  const transactions = await db.transactions
    .where('type')
    .equals('EXPENSE')
    .toArray();

  const breakdown: { [key: string]: number } = {};
  let total = 0;

  for (const t of transactions) {
    breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    total += t.amount;
  }

  return Object.entries(breakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}
