import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle, ArrowDownLeft, Calculator, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  onOpenExpense: () => void;
  onOpenIncome: () => void;
  onOpenCalculator: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenExpense,
  onOpenIncome,
  onOpenCalculator,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 my-6">
      {/* EXPENSE Action Button */}
      <motion.button
        type="button"
        onClick={onOpenExpense}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl md:rounded-3xl
          bg-gradient-to-b from-rose-500/15 via-rose-950/20 to-slate-900/60
          border border-rose-500/30 hover:border-rose-400/50
          backdrop-blur-2xl shadow-[0_10px_25px_-5px_rgba(244,63,94,0.18)]
          transition-all duration-300 text-center"
      >
        {/* Specular sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />
        
        <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <PlusCircle className="w-6 h-6 md:w-7 md:h-7 stroke-[2.2]" />
        </div>
        
        <div className="mt-2.5">
          <span className="block text-xs md:text-sm font-bold tracking-wide uppercase text-white group-hover:text-rose-200">
            Expense
          </span>
          <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
            Log Spend
          </span>
        </div>
      </motion.button>

      {/* INCOME Action Button */}
      <motion.button
        type="button"
        onClick={onOpenIncome}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl md:rounded-3xl
          bg-gradient-to-b from-emerald-500/15 via-emerald-950/20 to-slate-900/60
          border border-emerald-500/30 hover:border-emerald-400/50
          backdrop-blur-2xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.18)]
          transition-all duration-300 text-center"
      >
        {/* Specular sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        
        <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <ArrowDownLeft className="w-6 h-6 md:w-7 md:h-7 stroke-[2.2]" />
        </div>
        
        <div className="mt-2.5">
          <span className="block text-xs md:text-sm font-bold tracking-wide uppercase text-white group-hover:text-emerald-200">
            Income
          </span>
          <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
            Add Earnings
          </span>
        </div>
      </motion.button>

      {/* CALCULATOR Action Button */}
      <motion.button
        type="button"
        onClick={onOpenCalculator}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl md:rounded-3xl
          bg-gradient-to-b from-indigo-500/15 via-indigo-950/20 to-slate-900/60
          border border-indigo-500/30 hover:border-indigo-400/50
          backdrop-blur-2xl shadow-[0_10px_25px_-5px_rgba(99,102,241,0.18)]
          transition-all duration-300 text-center"
      >
        {/* Specular sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        
        <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <Calculator className="w-6 h-6 md:w-7 md:h-7 stroke-[2.2]" />
        </div>
        
        <div className="mt-2.5">
          <span className="block text-xs md:text-sm font-bold tracking-wide uppercase text-white group-hover:text-indigo-200">
            Calculator
          </span>
          <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
            Plan & Split
          </span>
        </div>
      </motion.button>
    </div>
  );
};
