export type TransactionType = 'expense' | 'income';

export type DefaultExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Rent'
  | 'Bills'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'EMI / Loan'
  | 'Fuel'
  | 'Groceries'
  | 'Personal'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Other';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type DefaultIncomeSource =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Bonus'
  | 'Interest'
  | 'Cashback'
  | 'Gift'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  tags?: string[];
  createdAt?: number;
}

export interface CategoryBudget {
  id: string;
  category: string;
  planned: number;
  spent: number;
  color: string;
  iconName: string;
}

export type PlanItemType = 'income' | 'expense' | 'savings';

export interface PlanItem {
  id: string;
  name: string;
  type: PlanItemType;
  plannedAmount: number;
  iconName: string;
  color: string;
  isCustom?: boolean;
}

export interface IncomePlan {
  id: string;
  category: string;
  planned: number;
  received: number;
  color: string;
  iconName: string;
}

export interface MonthlyBudgetOverview {
  month: string; // e.g. "October 2026"
  year: number;
  monthIndex: number; // 0-11
  totalIncome: number;
  actualIncome: number;
  plannedExpenses: number;
  actualExpenses: number;
  plannedSavings: number;
  actualSavings: number;
  expectedBalance: number;
}

export type ActiveTab = 'overview' | 'expenses' | 'income' | 'plan' | 'settings' | 'calculator';

export interface AppSettings {
  currency: {
    symbol: string;
    code: string;
    placement: 'before' | 'after';
  };
  themeMode?: 'dark-glass' | 'light-glass';
  appearance?: 'system' | 'light' | 'dark';
  monthlyCycleDay: number;
  hapticFeedback: boolean;
  backupReminder?: 'off' | 'weekly' | 'monthly';
  lastBackupDate?: string; // YYYY-MM-DD
}

export interface BackupData {
  version: number;
  appName: string;
  exportedAt: string;
  transactions: Transaction[];
  monthlyPlans: { monthKey: string; items: PlanItem[]; updatedAt?: number }[];
  customCategories: CategoryItem[];
  settings: AppSettings;
}
