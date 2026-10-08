import { CategoryBudget, IncomePlan, Transaction, AppSettings, CategoryItem, PlanItem } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  currency: {
    symbol: '₹',
    code: 'INR',
    placement: 'before',
  },
  themeMode: 'dark-glass',
  appearance: 'system',
  monthlyCycleDay: 1,
  hapticFeedback: true,
  backupReminder: 'weekly',
  lastBackupDate: undefined,
};

export const INITIAL_MONTHLY_PLAN: PlanItem[] = [];

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: '#f59e0b' },
  { id: 'cat-travel', name: 'Travel', icon: 'Plane', color: '#06b6d4' },
  { id: 'cat-rent', name: 'Rent', icon: 'Home', color: '#6366f1' },
  { id: 'cat-bills', name: 'Bills', icon: 'Zap', color: '#8b5cf6' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#a855f7' },
  { id: 'cat-health', name: 'Health', icon: 'HeartPulse', color: '#10b981' },
  { id: 'cat-education', name: 'Education', icon: 'GraduationCap', color: '#3b82f6' },
  { id: 'cat-emi', name: 'EMI / Loan', icon: 'Landmark', color: '#f97316' },
  { id: 'cat-fuel', name: 'Fuel', icon: 'Fuel', color: '#eab308' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'Apple', color: '#14b8a6' },
  { id: 'cat-personal', name: 'Personal', icon: 'User', color: '#f43f5e' },
  { id: 'cat-other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
];

export const DEFAULT_PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const DEFAULT_INCOME_SOURCES: CategoryItem[] = [
  { id: 'inc-src-salary', name: 'Salary', icon: 'Briefcase', color: '#3b82f6' },
  { id: 'inc-src-freelance', name: 'Freelance', icon: 'Laptop', color: '#10b981' },
  { id: 'inc-src-business', name: 'Business', icon: 'Building2', color: '#6366f1' },
  { id: 'inc-src-bonus', name: 'Bonus', icon: 'Award', color: '#f59e0b' },
  { id: 'inc-src-interest', name: 'Interest', icon: 'Percent', color: '#8b5cf6' },
  { id: 'inc-src-cashback', name: 'Cashback', icon: 'Coins', color: '#06b6d4' },
  { id: 'inc-src-gift', name: 'Gift', icon: 'Gift', color: '#ec4899' },
  { id: 'inc-src-other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
];

export const DEFAULT_INCOME_ACCOUNTS = [
  'Bank Account',
  'Cash',
  'UPI',
  'Other',
];

export const INITIAL_EXPENSE_CATEGORIES: CategoryBudget[] = [];

export const INITIAL_INCOME_PLANS: IncomePlan[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

