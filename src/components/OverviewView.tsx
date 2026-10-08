import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  Wallet, 
  TrendingUp, 
  ChevronRight,
  ChevronLeft,
  Plus,
  SlidersHorizontal,
  Clock,
  Sparkles
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AppSettings, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIconComponent } from '../utils/categoryIcons';

interface OverviewViewProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  totalIncome: number;
  actualIncome: number;
  plannedExpenses: number;
  actualExpenses: number;
  plannedSavings: number;
  actualSavings: number;
  expectedBalance: number;
  recentTransactions: Transaction[];
  settings: AppSettings;
  onOpenExpenseModal: () => void;
  onOpenIncomeModal: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToIncome: () => void;
  onNavigateToPlan?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  totalIncome,
  actualIncome,
  plannedExpenses,
  actualExpenses,
  plannedSavings,
  actualSavings,
  expectedBalance,
  recentTransactions,
  settings,
  onOpenExpenseModal,
  onOpenIncomeModal,
  onNavigateToExpenses,
  onNavigateToIncome,
  onNavigateToPlan,
}) => {
  // Available Money / Net Cash: Actual Income - Actual Expenses - Actual Savings
  const actualMoneyLeft = Math.max(0, actualIncome - actualExpenses - actualSavings);

  // Savings rate calculation
  const savingsRate = actualIncome > 0
    ? Math.round((actualSavings / actualIncome) * 100)
    : totalIncome > 0
      ? Math.round((plannedSavings / totalIncome) * 100)
      : 0;

  // Monthly spending percentage
  const spendingRatio = actualIncome > 0
    ? Math.min(100, Math.round((actualExpenses / actualIncome) * 100))
    : plannedExpenses > 0
      ? Math.min(100, Math.round((actualExpenses / plannedExpenses) * 100))
      : 0;

  // Recent 6 transactions
  const topRecent = recentTransactions.slice(0, 6);

  return (
    <div className="space-y-5 pb-6 sm:pb-8">
      {/* 1. Month Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
            Financial Snapshot
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentMonth}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-400 px-1.5 select-none hidden sm:inline">
            Month
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. TOP SUMMARY: FOUR COMPACT GLASS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Total Income */}
        <div 
          onClick={onNavigateToIncome}
          role="button"
          tabIndex={0}
          className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Total Income
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
            {formatCurrency(actualIncome > 0 ? actualIncome : totalIncome, settings)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {actualIncome > 0 ? `Planned: ${formatCurrency(totalIncome, settings)}` : 'Planned monthly'}
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div 
          onClick={onNavigateToExpenses}
          role="button"
          tabIndex={0}
          className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-rose-500/20 hover:border-rose-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Total Expenses
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
            {formatCurrency(actualExpenses, settings)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Budget: {formatCurrency(plannedExpenses, settings)}
          </div>
        </div>

        {/* Card 3: Savings */}
        <div 
          onClick={onNavigateToPlan}
          role="button"
          tabIndex={0}
          className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 hover:border-blue-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Savings
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
            {formatCurrency(actualSavings > 0 ? actualSavings : plannedSavings, settings)}
          </div>
          <div className="text-[10px] text-blue-400/90 font-medium mt-0.5 truncate">
            {savingsRate}% Savings Rate
          </div>
        </div>

        {/* Card 4: Available / Expected Balance */}
        <div 
          className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 transition"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Expected Balance
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
            {formatCurrency(expectedBalance, settings)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {actualMoneyLeft > 0 ? `Available: ${formatCurrency(actualMoneyLeft, settings)}` : 'After planned budget'}
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS: + EXPENSE and + INCOME */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenExpenseModal}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-[0.98] border border-rose-500/30 text-rose-300 font-bold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Expense</span>
        </button>

        <button
          type="button"
          onClick={onOpenIncomeModal}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-[0.98] border border-emerald-500/30 text-emerald-300 font-bold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Income</span>
        </button>
      </div>

      {/* 4. SMALL MONTHLY SPENDING & SAVINGS SUMMARY */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Monthly Summary</h3>
          </div>
          {onNavigateToPlan && (
            <button
              type="button"
              onClick={onNavigateToPlan}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <span>Manage Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress Bar: Spending Ratio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Budget Used: <strong className="text-white font-mono">{formatCurrency(actualExpenses, settings)}</strong>
            </span>
            <span className="text-slate-400 font-mono">
              {spendingRatio}% of {formatCurrency(plannedExpenses, settings)}
            </span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                spendingRatio > 90 ? 'bg-rose-500' : spendingRatio > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, spendingRatio)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Planned Savings</span>
            <span className="font-bold text-blue-300 font-mono">{formatCurrency(plannedSavings, settings)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Remaining Budget</span>
            <span className={`font-bold font-mono ${plannedExpenses - actualExpenses < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCurrency(Math.max(0, plannedExpenses - actualExpenses), settings)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Left</span>
            <span className="font-bold text-purple-300 font-mono">{formatCurrency(expectedBalance, settings)}</span>
          </div>
        </div>
      </div>

      {/* 5. RECENT TRANSACTIONS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recent Transactions
            </h3>
          </div>
          <button
            type="button"
            onClick={onNavigateToExpenses}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-0.5"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topRecent.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
            <p className="text-xs text-slate-400">No transactions recorded for this month yet.</p>
            <div className="flex justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={onOpenExpenseModal}
                className="text-xs text-rose-400 font-bold hover:underline"
              >
                + Add Expense
              </button>
              <button
                type="button"
                onClick={onOpenIncomeModal}
                className="text-xs text-emerald-400 font-bold hover:underline"
              >
                + Add Income
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {topRecent.map((tx) => {
              const IconComp = getCategoryIconComponent(tx.category);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isExpense ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {tx.description || tx.category}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{formatDate(tx.date)}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>{tx.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div 
                      className={`text-xs sm:text-sm font-extrabold font-mono ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount, settings)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
