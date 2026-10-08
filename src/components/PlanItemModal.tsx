import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Trash2, Sparkles, Tag, PiggyBank, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AppSettings, PlanItem, PlanItemType } from '../types';

interface PlanItemModalProps {
  isOpen: boolean;
  item: PlanItem | null;
  onClose: () => void;
  onSave: (item: PlanItem) => void;
  onDelete?: (id: string) => void;
  settings: AppSettings;
}

export const PlanItemModal: React.FC<PlanItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onDelete,
  settings,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PlanItemType>('expense');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type);
      setAmount(String(item.plannedAmount));
    } else {
      setName('');
      setType('expense');
      setAmount('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0 || !name.trim()) return;

    onSave({
      id: item ? item.id : `plan-item-${Date.now()}`,
      name: name.trim(),
      type,
      plannedAmount: num,
      iconName: item?.iconName || (type === 'income' ? 'TrendingUp' : type === 'savings' ? 'PiggyBank' : 'Tag'),
      color: item?.color || (type === 'income' ? '#10b981' : type === 'savings' ? '#3b82f6' : '#f59e0b'),
      isCustom: true,
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
          className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 backdrop-blur-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">
              {item ? `Edit Budget: ${item.name}` : 'Add Plan Item'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Type selector (Income / Expense / Savings) */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Category Group
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3 h-3" />
                  <span>Income</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('savings')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    type === 'savings'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PiggyBank className="w-3 h-3" />
                  <span>Savings</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                required
                autoFocus={!item}
                placeholder="e.g. Health Insurance, Gym, SIP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Planned Amount */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Planned Monthly Amount ({settings.currency.symbol})
              </label>
              <div className="relative flex items-center p-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-blue-400 transition">
                <span className="font-mono text-slate-400 font-bold mr-2 text-base">
                  {settings.currency.symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-lg font-bold font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {item && item.isCustom && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(item.id);
                    onClose();
                  }}
                  className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                Save Item
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
