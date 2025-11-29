export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'pix' | 'debit' | 'cash' | 'bill' | 'transfer' | 'credit';

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  gradient: string; // CSS class for gradient
}

export interface Transaction {
  id: string; // number or string in source, using string for consistency
  description: string;
  value: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  method: string; // loose string to match source 'Cartão Crédito', etc. or PaymentMethod
  cardId?: string | number; 
  installmentNumber?: string; // "1 de 10"
  isPaid?: boolean;
  isInvoicePayment?: boolean;
}

export interface FixedBill {
  id: string;
  name: string;
  value: number;
  dueDay: number; // Day of month
  category: string;
  lastPaidMonth?: string; // YYYY-MM
}

export interface AppData {
  initialBalance: number;
  transactions: Transaction[];
  cards: CreditCard[];
  fixedBills: FixedBill[];
  goals: Record<string, number>;
  categories: string[];
}
