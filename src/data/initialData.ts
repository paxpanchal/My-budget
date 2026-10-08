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

export const INITIAL_MONTHLY_PLAN: PlanItem[] = [
  // Income Sources
  { id: 'plan-inc-1', name: 'Salary / Main Income', type: 'income', plannedAmount: 52000, iconName: 'Briefcase', color: '#3b82f6' },
  { id: 'plan-inc-2', name: 'Other Income', type: 'income', plannedAmount: 13000, iconName: 'TrendingUp', color: '#10b981' },

  // Expenses (Separated from Savings)
  { id: 'plan-exp-1', name: 'Rent', type: 'expense', plannedAmount: 16500, iconName: 'Home', color: '#6366f1' },
  { id: 'plan-exp-2', name: 'EMI / Loans', type: 'expense', plannedAmount: 4500, iconName: 'Landmark', color: '#f97316' },
  { id: 'plan-exp-3', name: 'Utilities / Bills', type: 'expense', plannedAmount: 2200, iconName: 'Zap', color: '#8b5cf6' },
  { id: 'plan-exp-4', name: 'Food', type: 'expense', plannedAmount: 4500, iconName: 'Utensils', color: '#f59e0b' },
  { id: 'plan-exp-5', name: 'Travel', type: 'expense', plannedAmount: 2000, iconName: 'Plane', color: '#06b6d4' },
  { id: 'plan-exp-6', name: 'Groceries', type: 'expense', plannedAmount: 5500, iconName: 'Apple', color: '#14b8a6' },
  { id: 'plan-exp-7', name: 'Entertainment', type: 'expense', plannedAmount: 1500, iconName: 'Film', color: '#a855f7' },
  { id: 'plan-exp-8', name: 'Shopping', type: 'expense', plannedAmount: 2500, iconName: 'ShoppingBag', color: '#ec4899' },
  { id: 'plan-exp-9', name: 'Insurance', type: 'expense', plannedAmount: 1800, iconName: 'Shield', color: '#0284c7' },
  { id: 'plan-exp-10', name: 'Other', type: 'expense', plannedAmount: 1500, iconName: 'MoreHorizontal', color: '#64748b' },

  // Savings & Investments (Separated as money kept/invested)
  { id: 'plan-sav-1', name: 'Investments', type: 'savings', plannedAmount: 10000, iconName: 'TrendingUp', color: '#10b981' },
  { id: 'plan-sav-2', name: 'Savings', type: 'savings', plannedAmount: 6000, iconName: 'PiggyBank', color: '#3b82f6' },
];

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

export const INITIAL_EXPENSE_CATEGORIES: CategoryBudget[] = [
  {
    id: 'exp-1',
    category: 'Rent',
    planned: 1650,
    spent: 1650,
    color: '#6366f1',
    iconName: 'Home',
  },
  {
    id: 'exp-2',
    category: 'Food',
    planned: 450,
    spent: 263.20,
    color: '#f59e0b',
    iconName: 'Utensils',
  },
  {
    id: 'exp-3',
    category: 'Groceries',
    planned: 550,
    spent: 340,
    color: '#14b8a6',
    iconName: 'Apple',
  },
  {
    id: 'exp-4',
    category: 'Travel',
    planned: 200,
    spent: 45,
    color: '#06b6d4',
    iconName: 'Plane',
  },
  {
    id: 'exp-5',
    category: 'Bills',
    planned: 220,
    spent: 180,
    color: '#8b5cf6',
    iconName: 'Zap',
  },
  {
    id: 'exp-6',
    category: 'Shopping',
    planned: 250,
    spent: 90,
    color: '#ec4899',
    iconName: 'ShoppingBag',
  },
  {
    id: 'exp-7',
    category: 'Entertainment',
    planned: 150,
    spent: 110,
    color: '#a855f7',
    iconName: 'Film',
  },
  {
    id: 'exp-8',
    category: 'Fuel',
    planned: 180,
    spent: 85,
    color: '#eab308',
    iconName: 'Fuel',
  },
];

export const INITIAL_INCOME_PLANS: IncomePlan[] = [
  {
    id: 'inc-1',
    category: 'Salary',
    planned: 5200,
    received: 5200,
    color: '#3b82f6',
    iconName: 'Briefcase',
  },
  {
    id: 'inc-2',
    category: 'Freelance',
    planned: 850,
    received: 550,
    color: '#10b981',
    iconName: 'Laptop',
  },
  {
    id: 'inc-3',
    category: 'Bonus',
    planned: 300,
    received: 210,
    color: '#f59e0b',
    iconName: 'Award',
  },
  {
    id: 'inc-4',
    category: 'Interest',
    planned: 150,
    received: 90,
    color: '#8b5cf6',
    iconName: 'Percent',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 5200,
    category: 'Salary',
    description: 'October Monthly Salary - Tech Corp',
    date: '2026-10-01',
    paymentMethod: 'Bank Account',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 1650,
    category: 'Rent',
    description: 'Apartment Lease & Building Maintenance',
    date: '2026-10-02',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'tx-3',
    type: 'income',
    amount: 550,
    category: 'Freelance',
    description: 'Mobile App Design Milestone 1',
    date: '2026-10-04',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 142.50,
    category: 'Groceries',
    description: 'Whole Foods Market weekly essentials',
    date: '2026-10-04',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 68.20,
    category: 'Food',
    description: 'Artisan Bistro dinner & dessert',
    date: '2026-10-05',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 45.00,
    category: 'Fuel',
    description: 'Shell Gas Station Tank Refill',
    date: '2026-10-06',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 85.00,
    category: 'Bills',
    description: 'High-speed Fiber Internet Subscription',
    date: '2026-10-06',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'tx-8',
    type: 'expense',
    amount: 15.50,
    category: 'Food',
    description: 'Morning flat white & roasted sandwich',
    date: '2026-10-06',
    paymentMethod: 'UPI',
  },
];
