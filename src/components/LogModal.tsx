import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Calculator,
  CreditCard, 
  Tag, 
  Check,
  ShoppingBag,
  Home,
  Utensils,
  Plane,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Landmark,
  Fuel,
  Apple,
  User,
  MoreHorizontal
} from 'lucide-react';
import { AppSettings, TransactionType } from '../types';
import { DEFAULT_PAYMENT_METHODS } from '../data/initialData';
import { evaluateSimpleMath, QuickAmountCalculator } from './QuickAmountCalculator';

interface LogModalProps {
  isOpen: boolean;
  initialType?: TransactionType;
  onClose: () => void;
  onSubmit: (transaction: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => void;
  settings: AppSettings;
}

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Rent',
  'Bills',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'EMI / Loan',
  'Fuel',
  'Groceries',
  'Personal',
  'Other',
];

const INCOME_CATEGORIES = [
  'Primary Salary',
  'Freelance / Consulting',
  'Investments & Dividends',
  'Side Hustle',
  'Other Income',
];

const PAYMENT_METHODS = DEFAULT_PAYMENT_METHODS;

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  initialType = 'expense',
  onClose,
  onSubmit,
  settings,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(
    initialType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
  );
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState<string>(DEFAULT_PAYMENT_METHODS[0]);
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);

  // Switch categories when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let numAmount = parseFloat(amount);
    if (amount.includes('+') || amount.includes('-') || amount.includes('*') || amount.includes('/') || amount.includes('×') || amount.includes('÷')) {
      const evalRes = evaluateSimpleMath(amount);
      if (evalRes !== null) {
        numAmount = evalRes;
      }
    }

    if (isNaN(numAmount) || numAmount <= 0) return;

    onSubmit({
      type,
      amount: numAmount,
      category,
      description: description.trim() || (type === 'expense' ? `${category} Spend` : `${category} Inflow`),
      date,
      paymentMethod,
    });

    // Reset & close
    setAmount('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  const isExpense = type === 'expense';
  const categoriesList = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window / Bottom Sheet */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900/90 backdrop-blur-3xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Top specular highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Modal Header */}
          <div className="p-4 sm:p-6 pb-2 border-b border-white/5 flex items-center justify-between">
            {/* Segmented Type Picker */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isExpense
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>EXPENSE</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !isExpense
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>INCOME</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Big Apple Amount Input */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Amount ({settings.currency.code})
              </label>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-400 font-mono">
                  {settings.currency.symbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-3xl sm:text-4xl font-extrabold text-white font-mono placeholder-slate-600 focus:outline-none w-44 text-center"
                />
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  title="Calculate math expression"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Calculator className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categoriesList.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? isExpense
                            ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                            : 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate block">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note / Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Note / Merchant
              </label>
              <input
                type="text"
                placeholder={isExpense ? "e.g. Trader Joe's organic haul" : "e.g. October Consulting Retainer"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Date and Payment Method Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-blue-400"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isExpense
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/25'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Save {isExpense ? 'Expense' : 'Income'}</span>
              </motion.button>
            </div>
          </form>

          {/* Quick Amount Calculator */}
          <QuickAmountCalculator
            isOpen={isCalcOpen}
            onClose={() => setIsCalcOpen(false)}
            initialValue={amount}
            currencySymbol={settings.currency.symbol}
            title={isExpense ? 'Expense Calculator' : 'Income Calculator'}
            onApplyResult={(res) => setAmount(String(res))}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
