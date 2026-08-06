export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'Makanan'
  | 'Transportasi'
  | 'Tagihan'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Belanja'
  | 'Pendapatan'
  | 'Lainnya';

export interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  type: TransactionType;
  date: string; // ISO String Format
  createdAt: number;
}

export interface TransactionWithoutId extends Omit<Transaction, 'id'> {}

export interface AiExtractedTransaction {
  amount: number;
  category: TransactionCategory;
  description: string;
  type: TransactionType;
}
