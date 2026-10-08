import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Calendar, Wallet } from 'lucide-react';
import { AppSettings, CategoryItem, Transaction } from '../types';

interface EditIncomeModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  sources: CategoryItem[];
  paymentAccounts: string[];
  settings: AppSettings;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
}

export const EditIncomeModal: React.FC<EditIncomeModalProps> = ({
  isOpen,
  transaction,
  sources,
  paymentAccounts,
  settings,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentAccount, setPaymentAccount] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setSource(transaction.category);
      setDescription(transaction.description);
      setDate(transaction.date);
      setPaymentAccount(transaction.paymentMethod || paymentAccounts[0]);
    }
  }, [transaction, paymentAccounts]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    onSave({
      ...transaction,
      amount: num,
      category: source,
      description: description.trim() || `${source} Inflow`,
      date,
      paymentMethod: paymentAccount,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900/95 backdrop-blur-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Edit Income</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Amount */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Amount ({settings.currency.code})
              </label>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-mono text-slate-500 mr-1">
                  {settings.currency.symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-2xl font-mono font-bold text-white text-center w-36 focus:outline-none"
                />
              </div>
            </div>

            {/* Income Source Select */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Income Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Note / Memo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Date & Account */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Payment / Account
                </label>
                <select
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                >
                  {paymentAccounts.map((pa) => (
                    <option key={pa} value={pa}>{pa}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
