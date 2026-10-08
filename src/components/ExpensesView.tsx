import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  Calculator, 
  Check, 
  CheckCircle2, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronDown,
  Layers
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { QuickAmountCalculator, evaluateSimpleMath } from './QuickAmountCalculator';
import { AddCategoryModal } from './AddCategoryModal';
import { EditExpenseModal } from './EditExpenseModal';
import { AppSettings, CategoryBudget, CategoryItem, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIconComponent } from '../utils/categoryIcons';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_PAYMENT_METHODS } from '../data/initialData';
import { dbGetCustomCategories, dbSaveCustomCategory } from '../db/indexedDB';

interface ExpensesViewProps {
  currentMonth: string;
  plannedExpenses: number;
  actualExpenses: number;
  categories: CategoryBudget[];
  transactions: Transaction[];
  settings: AppSettings;
  initialAmount?: number;
  onAddExpense: (expense: {
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => void;
  onEditExpense: (updatedExpense: Transaction) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  currentMonth,
  plannedExpenses,
  actualExpenses,
  categories,
  transactions,
  settings,
  initialAmount,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  // Category list state (including any user-created custom categories)
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(DEFAULT_EXPENSE_CATEGORIES);

  // Form State
  const [amountInput, setAmountInput] = useState<string>(
    initialAmount && initialAmount > 0 ? String(initialAmount) : ''
  );

  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      setAmountInput(String(initialAmount));
    }
  }, [initialAmount]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [noteInput, setNoteInput] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('UPI');

  // Modals & Popups
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Success Feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter in history
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Expense transactions only
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  // Summary Metrics:
  // 1. Today's expenses
  const todayExpensesTotal = expenseTransactions
    .filter((t) => t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. This month's expenses
  const thisMonthExpensesTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  // 3. Number of transactions
  const totalTxCount = expenseTransactions.length;

  // Handle Amount change with support for direct arithmetic detection
  const handleAmountBlur = () => {
    if (amountInput.includes('+') || amountInput.includes('-') || amountInput.includes('*') || amountInput.includes('/')) {
      const evaluated = evaluateSimpleMath(amountInput);
      if (evaluated !== null && evaluated > 0) {
        setAmountInput(String(evaluated));
      }
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evaluate if user entered math like 250 + 120 + 80 directly
    let parsedAmount = parseFloat(amountInput);
    if (amountInput.includes('+') || amountInput.includes('-') || amountInput.includes('*') || amountInput.includes('/') || amountInput.includes('×') || amountInput.includes('÷')) {
      const evaluated = evaluateSimpleMath(amountInput);
      if (evaluated !== null) {
        parsedAmount = evaluated;
      }
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense({
      amount: parsedAmount,
      category: selectedCategory,
      description: noteInput.trim() || `${selectedCategory} Expense`,
      date: dateInput,
      paymentMethod: selectedPaymentMethod,
    });

    // Success notification
    setSuccessMessage(`Saved ${formatCurrency(parsedAmount, settings)} for ${selectedCategory}`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);

    // Reset form for lightning fast next entry
    setAmountInput('');
    setNoteInput('');
  };

  // Quick Date presets
  const handleSetToday = () => setDateInput(todayStr);
  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDateInput(d.toISOString().split('T')[0]);
  };

  // Custom Category added
  const handleCustomCategoryAdded = async (newCategory: CategoryItem) => {
    setCategoryItems((prev) => [...prev, newCategory]);
    setSelectedCategory(newCategory.name);
    try {
      await dbSaveCustomCategory(newCategory);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const stored = await dbGetCustomCategories();
        const customExpenseCats = stored.filter((c) => !c.id.startsWith('inc-src-') && !c.id.startsWith('custom-inc-'));
        if (customExpenseCats.length > 0) {
          setCategoryItems((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newOnes = customExpenseCats.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newOnes];
          });
        }
      } catch {
        // safe fallback
      }
    };
    loadCategories();
  }, []);

  // Filtered History
  const filteredTransactions = expenseTransactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCat = filterCategory === 'all' || tx.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-6 sm:pb-8">
      {/* 1. TOP EXPENSE SUMMARY */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Expense Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Expenses · {currentMonth}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Open Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-rose-400" />
              <span>Calculator</span>
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:block">
              Budget: {formatCurrency(plannedExpenses, settings)}
            </span>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Today's expenses */}
          <GlassCard variant="glow-rose" className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
              Today's Expenses
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatCurrency(todayExpensesTotal, settings)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Logged today
            </span>
          </GlassCard>

          {/* This month's expenses */}
          <GlassCard variant="default" className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
              This Month's Expenses
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatCurrency(thisMonthExpensesTotal, settings)}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {formatCurrency(Math.max(0, plannedExpenses - thisMonthExpensesTotal), settings)} remaining in budget
            </span>
          </GlassCard>

          {/* Number of transactions */}
          <GlassCard variant="subtle" className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Transactions
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {totalTxCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Records this month
            </span>
          </GlassCard>
        </div>
      </div>

      {/* SUCCESS TOAST / BANNER */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-600/20 to-teal-500/20 border border-emerald-400/40 backdrop-blur-2xl flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-200">
                {successMessage}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">Recorded</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ADD EXPENSE INTERFACE (Clean, ultra-fast entry) */}
      <GlassCard className="p-5 sm:p-6 border-rose-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Quick Add Expense
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Fast, few-tap logging
          </span>
        </div>

        <form onSubmit={handleSaveExpense} className="space-y-5">
          {/* 1. AMOUNT WITH CALCULATOR BUTTON */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              1. Amount
            </label>
            <div className="relative flex items-center p-3 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-rose-400/60 focus-within:bg-white/[0.06] transition-all">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-400 mr-2 select-none">
                {settings.currency.symbol}
              </span>
              
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9+*×÷/.\- ]*"
                autoComplete="off"
                placeholder="0.00 or e.g. 250+120"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onBlur={handleAmountBlur}
                className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white font-mono placeholder-slate-600 focus:outline-none"
              />

              {/* Small Calculator button beside Amount */}
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                title="Calculate math expression (e.g. 250 + 120 + 80)"
                className="ml-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
              >
                <Calculator className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold hidden sm:inline">Calc</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Tip: You can also type directly <span className="font-mono text-slate-400">250 + 120 + 80</span>
            </span>
          </div>

          {/* 2. EXPENSE CATEGORY (Selectable glass buttons/icons + "+ Add Category") */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                2. Category
              </label>
              <span className="text-[11px] text-slate-400">
                Selected: <strong className="text-white">{selectedCategory}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {categoryItems.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const IconComponent = getCategoryIconComponent(cat.name, cat.icon);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`relative p-2.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/25 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-400'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: isSelected ? `${cat.color}40` : `${cat.color}20`,
                        color: cat.color 
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-tight truncate max-w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}

              {/* “+ Add Category” Button */}
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="p-2.5 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.07] text-slate-400 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold tracking-tight">
                  + Add
                </span>
              </button>
            </div>
          </div>

          {/* 3. DATE & 4. NOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DATE */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  3. Date
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleSetYesterday}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                  >
                    Yesterday
                  </button>
                </div>
              </div>

              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-400 transition"
                />
              </div>
            </div>

            {/* NOTE (Optional short note) */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                4. Note <span className="text-slate-500 normal-case font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch with colleagues, Metro card, etc."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition"
              />
            </div>
          </div>

          {/* 5. PAYMENT METHOD (Selectable glass buttons) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
              5. Payment Method
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedPaymentMethod === pm;
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(pm)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                        : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. SAVE EXPENSE (Large primary glass button) */}
          <div className="pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(244,63,94,0.4)] transition-all cursor-pointer border border-rose-400/40"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Save Expense</span>
            </motion.button>
          </div>
        </form>
      </GlassCard>

      {/* 3. EXPENSE HISTORY (Elegant glass cards below entry area) */}
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>Expense History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredTransactions.length} of {expenseTransactions.length} expenses
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search note/method..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
            >
              <option value="all">All Categories</option>
              {categoryItems.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* History List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No expenses found. Add your first expense above in seconds!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((tx) => {
              const IconComp = getCategoryIconComponent(tx.category);

              return (
                <div 
                  key={tx.id} 
                  className="py-3.5 px-2 sm:px-3 rounded-2xl hover:bg-white/[0.02] flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {tx.category}
                        </span>
                        {tx.paymentMethod && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="truncate">{tx.description}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="shrink-0">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Action Controls (Edit & Delete) */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-extrabold font-mono text-rose-400">
                      -{formatCurrency(tx.amount, settings)}
                    </span>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(tx)}
                        title="Edit expense"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(tx.id)}
                        title="Delete expense"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* QUICK POPUP MATH CALCULATOR */}
      <QuickAmountCalculator
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        initialValue={amountInput}
        currencySymbol={settings.currency.symbol}
        title="Expense Calculator"
        onApplyResult={(result) => setAmountInput(String(result))}
      />

      {/* ADD CUSTOM CATEGORY MODAL */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleCustomCategoryAdded}
      />

      {/* EDIT EXPENSE MODAL */}
      <EditExpenseModal
        isOpen={editingTransaction !== null}
        transaction={editingTransaction}
        categories={categoryItems}
        paymentMethods={DEFAULT_PAYMENT_METHODS}
        settings={settings}
        onClose={() => setEditingTransaction(null)}
        onSave={onEditExpense}
      />
    </div>
  );
};
