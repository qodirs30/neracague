export interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  monthlyInstallment: number;
  remainingAmount: number;
  dueDate: string;
  createdAt: number;
}

export type DebtWithoutId = Omit<Debt, 'id'>;
