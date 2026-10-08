import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Calendar, 
  Calculator, 
  Check, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Sparkles,
  ArrowDownRight,
  Wallet,
  Clock,
  Briefcase
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { QuickAmountCalculator, evaluateSimpleMath } from './QuickAmountCalculator';
import { AddIncomeSourceModal } from './AddIncomeSourceModal';
import { EditIncomeModal } from './EditIncomeModal';
import { AppSettings, CategoryItem, IncomePlan, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIconComponent } from '../utils/categoryIcons';
import { DEFAULT_INCOME_SOURCES, DEFAULT_INCOME_ACCOUNTS } from '../data/initialData';
import { dbGetCustomCategories, dbSaveCustomCategory } from '../db/indexedDB';

interface IncomeViewProps {
  currentMonth: string;
  totalIncome: number;
  actualIncome: number;
  incomePlans: IncomePlan[];
  transactions: Transaction[];
  settings: AppSettings;
  initialAmount?: number;
  onAddIncome: (income: {
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => void;
  onEditIncome: (updatedIncome: Transaction) => void;
  onDeleteIncome: (id: string) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  currentMonth,
  totalIncome,
  actualIncome,
  incomePlans,
  transactions,
  settings,
  initialAmount,
  onAddIncome,
  onEditIncome,
  onDeleteIncome,
}) => {
  // Sources state (including any user-created custom income sources)
  const [sourcesList, setSourcesList] = useState<CategoryItem[]>(DEFAULT_INCOME_SOURCES);

  // Form State
  const [amountInput, setAmountInput] = useState<string>(
    initialAmount && initialAmount > 0 ? String(initialAmount) : ''
  );

  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      setAmountInput(String(initialAmount));
    }
  }, [initialAmount]);
  const [selectedSource, setSelectedSource] = useState<string>('Salary');
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [noteInput, setNoteInput] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('Bank Account');

  // Modals & Popups
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Success Feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter in history
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Income transactions only
  const incomeTransactions = transactions.filter((t) => t.type === 'income');

  // Summary Metrics:
  // 1. Total Income Today
  const todayIncomeTotal = incomeTransactions
    .filter((t) => t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Total Income This Month
  const thisMonthIncomeTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // 3. Number of Income Entries
  const totalIncomeCount = incomeTransactions.length;

  // Handle Amount change with support for direct arithmetic detection (e.g. 50000 - 5000)
  const handleAmountBlur = () => {
    if (amountInput.includes('+') || amountInput.includes('-') || amountInput.includes('*') || amountInput.includes('/') || amountInput.includes('×') || amountInput.includes('÷')) {
      const evaluated = evaluateSimpleMath(amountInput);
      if (evaluated !== null && evaluated > 0) {
        setAmountInput(String(evaluated));
      }
    }
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();

    // Evaluate math expressions like 50000 - 5000
    let parsedAmount = parseFloat(amountInput);
    if (amountInput.includes('+') || amountInput.includes('-') || amountInput.includes('*') || amountInput.includes('/') || amountInput.includes('×') || amountInput.includes('÷')) {
      const evaluated = evaluateSimpleMath(amountInput);
      if (evaluated !== null) {
        parsedAmount = evaluated;
      }
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddIncome({
      amount: parsedAmount,
      category: selectedSource,
      description: noteInput.trim() || `${selectedSource} Inflow`,
      date: dateInput,
      paymentMethod: selectedAccount,
    });

    // Success notification
    setSuccessMessage(`Recorded ${formatCurrency(parsedAmount, settings)} from ${selectedSource}`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);

    // Clear the form
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

  // Custom Source added
  const handleCustomSourceAdded = async (newSource: CategoryItem) => {
    setSourcesList((prev) => [...prev, newSource]);
    setSelectedSource(newSource.name);
    try {
      await dbSaveCustomCategory(newSource);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    const loadSources = async () => {
      try {
        const stored = await dbGetCustomCategories();
        const customIncomeSources = stored.filter((c) => c.id.startsWith('custom-inc-') || c.id.startsWith('inc-src-'));
        if (customIncomeSources.length > 0) {
          setSourcesList((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newOnes = customIncomeSources.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newOnes];
          });
        }
      } catch {
        // safe fallback
      }
    };
    loadSources();
  }, []);

  // Filtered History
  const filteredTransactions = incomeTransactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesSrc = filterSource === 'all' || tx.category === filterSource;
    return matchesSearch && matchesSrc;
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* 1. TOP INCOME SUMMARY */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Revenue & Inflow Summary
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Income · {currentMonth}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Open Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calculator</span>
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:block">
              Target: {formatCurrency(totalIncome, settings)}
            </span>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Total Income Today */}
          <GlassCard variant="glow-emerald" className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Total Income Today
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatCurrency(todayIncomeTotal, settings)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Received today
            </span>
          </GlassCard>

          {/* Total Income This Month */}
          <GlassCard variant="default" className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
              Total Income This Month
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight text-emerald-400">
              {formatCurrency(thisMonthIncomeTotal, settings)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Target planned: {formatCurrency(totalIncome, settings)}
            </span>
          </GlassCard>

          {/* Number of Income Entries */}
          <GlassCard variant="subtle" className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Number of Income Entries
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {totalIncomeCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Inflows recorded
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
            <span className="text-[11px] text-emerald-400 font-medium">Added</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ADD INCOME INTERFACE (Clean, ultra-fast entry) */}
      <GlassCard className="p-5 sm:p-6 border-emerald-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Quick Add Income
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Record earnings in a few taps
          </span>
        </div>

        <form onSubmit={handleSaveIncome} className="space-y-5">
          {/* 1. AMOUNT WITH CALCULATOR BUTTON */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              1. Amount
            </label>
            <div className="relative flex items-center p-3 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-400/60 focus-within:bg-white/[0.06] transition-all">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 mr-2 select-none">
                {settings.currency.symbol}
              </span>
              
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9+*×÷/.\- ]*"
                autoComplete="off"
                placeholder="0.00 or e.g. 50000-5000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onBlur={handleAmountBlur}
                className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white font-mono placeholder-slate-600 focus:outline-none"
              />

              {/* Small Calculator button beside Amount */}
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                title="Calculate math expression (e.g. 50000 - 5000)"
                className="ml-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold hidden sm:inline">Calc</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Tip: You can calculate deductions or bonuses like <span className="font-mono text-slate-400">50000 - 5000</span>
            </span>
          </div>

          {/* 2. INCOME SOURCE (Quick-select glass buttons + "+ Add Source") */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                2. Income Source
              </label>
              <span className="text-[11px] text-slate-400">
                Selected: <strong className="text-white">{selectedSource}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {sourcesList.map((src) => {
                const isSelected = selectedSource === src.name;
                const IconComponent = getCategoryIconComponent(src.name, src.icon);

                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSelectedSource(src.name)}
                    className={`relative p-2.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: isSelected ? `${src.color}40` : `${src.color}20`,
                        color: src.color 
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-tight truncate max-w-full">
                      {src.name}
                    </span>
                  </button>
                );
              })}

              {/* “+ Add Source” Button */}
              <button
                type="button"
                onClick={() => setIsAddSourceOpen(true)}
                className="p-2.5 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.07] text-slate-400 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold tracking-tight">
                  + Add Source
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 transition"
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
                placeholder="e.g. October monthly payout, Consulting milestone"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>

          {/* 5. PAYMENT / ACCOUNT (Selectable options) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
              5. Payment / Account
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_INCOME_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount === acc;
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => setSelectedAccount(acc)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {acc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. SAVE INCOME (Large primary button) */}
          <div className="pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all cursor-pointer border border-emerald-400/40"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Save Income</span>
            </motion.button>
          </div>
        </form>
      </GlassCard>

      {/* 3. INCOME HISTORY (Elegant glass cards below entry area) */}
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Income History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredTransactions.length} of {incomeTransactions.length} inflows
            </p>
          </div>

          {/* Search & Source Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search note/source..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Sources</option>
              {sourcesList.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* History List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No income entries recorded yet. Add your first earnings above!
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
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {tx.category}
                        </span>
                        {tx.paymentMethod && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-emerald-300 font-medium">
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
                    <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-400">
                      +{formatCurrency(tx.amount, settings)}
                    </span>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(tx)}
                        title="Edit income"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteIncome(tx.id)}
                        title="Delete income"
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
        title="Income Calculator"
        onApplyResult={(result) => setAmountInput(String(result))}
      />

      {/* ADD CUSTOM SOURCE MODAL */}
      <AddIncomeSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onAddSource={handleCustomSourceAdded}
      />

      {/* EDIT INCOME MODAL */}
      <EditIncomeModal
        isOpen={editingTransaction !== null}
        transaction={editingTransaction}
        sources={sourcesList}
        paymentAccounts={DEFAULT_INCOME_ACCOUNTS}
        settings={settings}
        onClose={() => setEditingTransaction(null)}
        onSave={onEditIncome}
      />
    </div>
  );
};
