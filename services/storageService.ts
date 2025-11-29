import { AppData, Transaction } from '../types';

const STORAGE_KEY = 'financas_pro_offline_v1';

export const INITIAL_CATS = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Salário', 'Investimento', 'Contas Fixas', 'Extra', 'Fatura Cartão'];

const DEFAULT_DATA: AppData = {
  initialBalance: 0,
  transactions: [],
  cards: [],
  fixedBills: [],
  goals: {},
  categories: INITIAL_CATS
};

export const getAppData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_DATA;
  } catch (e) {
    console.error('Failed to load data', e);
    return DEFAULT_DATA;
  }
};

export const saveAppData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
};

export const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

// Helper to calculate invoice dates
export const calculateInvoiceDate = (purchaseDate: string, closingDay: number, dueDay: number, monthOffset = 0): string => {
    const date = new Date(purchaseDate + 'T12:00:00');
    const day = date.getDate();
    let month = date.getMonth(); 
    let year = date.getFullYear();
    
    // If purchase is after closing day, it goes to next month
    if (day > closingDay) {
        month++;
    }
    
    month += monthOffset;
    
    // JS handles month overflow (e.g., month 12 becomes Jan next year) automatically
    const finalDate = new Date(year, month, dueDay);
    return finalDate.toISOString().slice(0, 10);
};

export const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
export const formatDate = (date: string) => { if(!date) return ''; const d = new Date(date+'T00:00:00'); return new Intl.DateTimeFormat('pt-BR').format(d); };
export const getMonthName = (m: string) => { if(!m) return ''; const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo)-1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }); };
