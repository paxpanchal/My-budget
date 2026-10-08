import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator as CalcIcon, 
  Delete, 
  History, 
  RotateCcw, 
  Check, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Shield, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AppSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CalcHistoryItem, getStoredCalcHistory, saveCalcHistoryItem, clearStoredCalcHistory } from '../utils/calcHistory';
import { evaluateSimpleMath } from './QuickAmountCalculator';

interface CalculatorViewProps {
  settings: AppSettings;
  defaultMonthlyIncome?: number;
  onSendToExpense?: (amount: number) => void;
  onSendToIncome?: (amount: number) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  settings,
  defaultMonthlyIncome = 65000,
  onSendToExpense,
  onSendToIncome,
}) => {
  // Calculator expression & display
  const [expression, setExpression] = useState<string>('');
  const [activeResult, setActiveResult] = useState<number | null>(null);
  const [history, setHistory] = useState<CalcHistoryItem[]>([]);
  const [showBudgetSplit, setShowBudgetSplit] = useState<boolean>(false);

  // 50/30/20 state
  const [customIncome, setCustomIncome] = useState<number>(defaultMonthlyIncome);
  const needsAmount = customIncome * 0.50;
  const wantsAmount = customIncome * 0.30;
  const savingsAmount = customIncome * 0.20;

  useEffect(() => {
    setHistory(getStoredCalcHistory());
  }, []);

  // Update live preview of calculation as expression changes
  useEffect(() => {
    if (expression.trim() === '') {
      setActiveResult(null);
      return;
    }
    const evalRes = evaluateSimpleMath(expression);
    setActiveResult(evalRes);
  }, [expression]);

  const handleAppend = (char: string) => {
    setExpression((prev) => prev + char);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
    setActiveResult(null);
  };

  const handleEquals = () => {
    const res = evaluateSimpleMath(expression);
    if (res !== null) {
      if (expression.match(/[+\-*/%×÷]/)) {
        const updated = saveCalcHistoryItem(expression, res);
        setHistory(updated);
      }
      setExpression(String(res));
      setActiveResult(res);
    }
  };

  const handleReuseHistory = (item: CalcHistoryItem) => {
    setExpression(String(item.result));
    setActiveResult(item.result);
  };

  const handleClearHistory = () => {
    clearStoredCalcHistory();
    setHistory([]);
  };

  const currentDisplayNumber = activeResult !== null ? activeResult : (parseFloat(expression) || 0);

  return (
    <div className="space-y-6 pb-6 sm:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-1 text-center sm:text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Financial Tool
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Calculator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Fast budgeting calculations with instant Expense & Income shortcuts.
        </p>
      </div>

      {/* MAIN MOBILE-FIRST GLASS CALCULATOR */}
      <GlassCard className="p-4 sm:p-6 border-indigo-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Large Glass Display Screen */}
        <div className="p-4 sm:p-5 rounded-3xl bg-black/55 border border-white/10 text-right space-y-1.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
          {/* Active mathematical expression */}
          <div className="text-xs sm:text-sm font-mono text-slate-400 min-h-[1.5rem] tracking-wide overflow-x-auto whitespace-nowrap">
            {expression || '0'}
          </div>

          {/* Primary Calculated Result */}
          <div className="text-3xl sm:text-5xl font-extrabold text-white font-mono flex items-center justify-end gap-1.5 tracking-tight">
            <span className="text-xl sm:text-2xl text-slate-500 font-normal">
              {settings.currency.symbol}
            </span>
            <span className="truncate">
              {currentDisplayNumber.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Quick Send Buttons (Link directly to Expense or Income) */}
        {(onSendToExpense || onSendToIncome) && (
          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            {onSendToExpense && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onSendToExpense(currentDisplayNumber)}
                disabled={currentDisplayNumber <= 0}
                className="py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log as Expense</span>
              </motion.button>
            )}

            {onSendToIncome && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onSendToIncome(currentDisplayNumber)}
                disabled={currentDisplayNumber <= 0}
                className="py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log as Income</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Large Touch-Friendly Buttons Keypad Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5 mt-4">
          {/* Row 1: C, ⌫, %, ÷ */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={handleClear}
            className="py-3.5 sm:py-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-base flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-rose-500/20"
          >
            C
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={handleBackspace}
            className="py-3.5 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold text-base flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-white/10"
          >
            <Delete className="w-5 h-5" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend('%')}
            className="py-3.5 sm:py-4 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-extrabold text-base flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-blue-400/20"
          >
            %
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend(' ÷ ')}
            className="py-3.5 sm:py-4 rounded-2xl bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 font-extrabold text-lg flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-blue-400/30"
          >
            ÷
          </motion.button>

          {/* Row 2: 7, 8, 9, × */}
          {['7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              type="button"
              whileTap={{ scale: 0.90 }}
              onClick={() => handleAppend(digit)}
              className="py-3.5 sm:py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-lg sm:text-xl font-mono flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-white/5"
            >
              {digit}
            </motion.button>
          ))}
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend(' × ')}
            className="py-3.5 sm:py-4 rounded-2xl bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 font-extrabold text-lg flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-blue-400/30"
          >
            ×
          </motion.button>

          {/* Row 3: 4, 5, 6, - */}
          {['4', '5', '6'].map((digit) => (
            <motion.button
              key={digit}
              type="button"
              whileTap={{ scale: 0.90 }}
              onClick={() => handleAppend(digit)}
              className="py-3.5 sm:py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-lg sm:text-xl font-mono flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-white/5"
            >
              {digit}
            </motion.button>
          ))}
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend(' - ')}
            className="py-3.5 sm:py-4 rounded-2xl bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 font-extrabold text-lg flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-blue-400/30"
          >
            -
          </motion.button>

          {/* Row 4: 1, 2, 3, + */}
          {['1', '2', '3'].map((digit) => (
            <motion.button
              key={digit}
              type="button"
              whileTap={{ scale: 0.90 }}
              onClick={() => handleAppend(digit)}
              className="py-3.5 sm:py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-lg sm:text-xl font-mono flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-white/5"
            >
              {digit}
            </motion.button>
          ))}
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend(' + ')}
            className="py-3.5 sm:py-4 rounded-2xl bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 font-extrabold text-lg flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-blue-400/30"
          >
            +
          </motion.button>

          {/* Row 5: 0, ., = (Full double width for =) */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend('0')}
            className="py-3.5 sm:py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-lg sm:text-xl font-mono flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-white/5"
          >
            0
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.90 }}
            onClick={() => handleAppend('.')}
            className="py-3.5 sm:py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-lg sm:text-xl font-mono flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 border border-white/5"
          >
            .
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleEquals}
            className="col-span-2 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xl flex items-center justify-center transition cursor-pointer shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-95 border border-blue-400/40"
          >
            =
          </motion.button>
        </div>
      </GlassCard>

      {/* RECENT CALCULATIONS HISTORY */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Recent Calculations
            </h3>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition"
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No recent calculations yet. Perform math above to see history here.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleReuseHistory(item)}
                className="py-2.5 px-2 rounded-xl hover:bg-white/[0.03] transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                    {item.expression}
                  </span>
                  <span className="text-xs text-slate-600">=</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                    {settings.currency.symbol}{item.result.toLocaleString()}
                  </span>
                </div>

                <span className="text-[10px] text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to reuse
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* OPTIONAL 50/30/20 BUDGET SPLIT PLANNER (Preserved existing feature) */}
      <GlassCard className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowBudgetSplit((prev) => !prev)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">50 / 30 / 20 Budget Rule Splitter</h3>
              <p className="text-[11px] text-slate-400">Needs 50% · Wants 30% · Savings 20%</p>
            </div>
          </div>
          {showBudgetSplit ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {showBudgetSplit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/10 space-y-4 overflow-hidden"
            >
              {/* Income Slider / Input */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Monthly Net Income:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formatCurrency(customIncome, settings)}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="5000"
                  max="250000"
                  step="2500"
                  value={customIncome}
                  onChange={(e) => setCustomIncome(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              {/* Three Allocations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] font-bold uppercase text-blue-400 block">Needs (50%)</span>
                  <span className="text-base font-bold text-white font-mono block mt-0.5">
                    {formatCurrency(needsAmount, settings)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Wants (30%)</span>
                  <span className="text-base font-bold text-white font-mono block mt-0.5">
                    {formatCurrency(wantsAmount, settings)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Savings (20%)</span>
                  <span className="text-base font-bold text-white font-mono block mt-0.5">
                    {formatCurrency(savingsAmount, settings)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};
