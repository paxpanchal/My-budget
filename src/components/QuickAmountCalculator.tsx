import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Check, X, Delete, History, RotateCcw, ArrowRight } from 'lucide-react';
import { CalcHistoryItem, getStoredCalcHistory, saveCalcHistoryItem } from '../utils/calcHistory';

interface QuickAmountCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult: (result: number) => void;
  initialValue?: string;
  currencySymbol: string;
  title?: string;
}

// Safe expression evaluator for arithmetic: +, -, *, /, %, decimals
export const evaluateSimpleMath = (expr: string): number | null => {
  try {
    if (!expr || expr.trim() === '') return null;

    // Normalize operators
    let cleaned = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/–/g, '-')
      .replace(/—/g, '-');

    // Handle percentage expressions like "500 * 10%" or "500 %"
    cleaned = cleaned.replace(/(\d+\.?\d*)\s*%/g, '($1/100)');

    // Only allow safe characters: digits, operators, parens, decimal
    if (/[^0-9+\-*/.()\s]/.test(cleaned)) {
      return null;
    }

    // Tokenize
    const tokens = cleaned.match(/(\d+\.?\d*|[+\-*/()])/g);
    if (!tokens || tokens.length === 0) return null;

    // Simple shunting-yard or function evaluator with strict safety
    const evalSimple = Function(`"use strict"; return (${cleaned});`);
    const res = evalSimple();

    if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
      return Math.round(res * 100) / 100;
    }
    return null;
  } catch {
    return null;
  }
};

export const QuickAmountCalculator: React.FC<QuickAmountCalculatorProps> = ({
  isOpen,
  onClose,
  onApplyResult,
  initialValue = '',
  currencySymbol,
  title = 'Quick Calculator',
}) => {
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<CalcHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setExpression(initialValue && !isNaN(Number(initialValue)) ? initialValue : (initialValue || ''));
      setHistory(getStoredCalcHistory());
      setShowHistory(false);
    }
  }, [isOpen, initialValue]);

  const calculatedResult = evaluateSimpleMath(expression);

  if (!isOpen) return null;

  const handleAppend = (char: string) => {
    setExpression((prev) => prev + char);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
  };

  const handleApply = () => {
    const finalVal = calculatedResult !== null ? calculatedResult : parseFloat(expression);
    if (!isNaN(finalVal) && finalVal > 0) {
      if (expression && expression.match(/[+\-*/%×÷]/)) {
        saveCalcHistoryItem(expression, finalVal);
      }
      onApplyResult(finalVal);
      onClose();
    }
  };

  const handleReuseHistory = (item: CalcHistoryItem) => {
    setExpression(String(item.result));
    setShowHistory(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 backdrop-blur-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-4 sm:p-5 z-10 overflow-hidden"
        >
          {/* Specular sheen */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shadow-inner">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {title}
                </h3>
                <span className="text-[10px] text-slate-400">
                  Tap Use Result to insert amount
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                  showHistory ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
                title="Toggle Recent Calculations"
              >
                <History className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Calculations Drawer */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-white/10 py-2"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
                  <span>Recent Calculations</span>
                  <span className="text-[10px] text-slate-500">Tap to reuse</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {history.length === 0 ? (
                    <div className="text-[11px] text-slate-500 py-2 text-center">No calculations yet.</div>
                  ) : (
                    history.slice(0, 4).map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleReuseHistory(h)}
                        className="w-full p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-between text-xs transition text-left group"
                      >
                        <span className="text-slate-400 font-mono text-[11px] truncate max-w-[150px]">{h.expression}</span>
                        <span className="font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                          = {currencySymbol}{h.result.toLocaleString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Large Easy-to-Read Display */}
          <div className="mt-3 p-3.5 rounded-2xl bg-black/50 border border-white/10 text-right space-y-1 shadow-inner">
            <div className="text-xs font-mono text-slate-400 min-h-[1.25rem] truncate">
              {expression || 'Enter numbers or math (e.g. 250 + 120 + 80)'}
            </div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-center justify-end gap-1 tracking-tight">
              <span className="text-lg text-slate-500 font-normal">{currencySymbol}</span>
              <span className="truncate">
                {calculatedResult !== null ? calculatedResult.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : (expression || '0')}
              </span>
            </div>
          </div>

          {/* Keypad Grid (Large touch-friendly buttons) */}
          <div className="grid grid-cols-4 gap-2 mt-3.5">
            {/* Row 1 */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleClear}
              className="py-3 rounded-2xl bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30 transition text-sm flex items-center justify-center cursor-pointer"
            >
              C
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleBackspace}
              className="py-3 rounded-2xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition text-sm flex items-center justify-center cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend('%')}
              className="py-3 rounded-2xl bg-blue-500/15 text-blue-400 font-bold hover:bg-blue-500/25 transition text-sm flex items-center justify-center cursor-pointer"
            >
              %
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend(' ÷ ')}
              className="py-3 rounded-2xl bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30 transition text-base flex items-center justify-center cursor-pointer"
            >
              ÷
            </motion.button>

            {/* Row 2 */}
            {['7', '8', '9'].map((digit) => (
              <motion.button
                key={digit}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAppend(digit)}
                className="py-3 rounded-2xl bg-white/[0.04] text-white font-semibold hover:bg-white/[0.08] transition text-base font-mono flex items-center justify-center cursor-pointer"
              >
                {digit}
              </motion.button>
            ))}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend(' × ')}
              className="py-3 rounded-2xl bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30 transition text-base flex items-center justify-center cursor-pointer"
            >
              ×
            </motion.button>

            {/* Row 3 */}
            {['4', '5', '6'].map((digit) => (
              <motion.button
                key={digit}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAppend(digit)}
                className="py-3 rounded-2xl bg-white/[0.04] text-white font-semibold hover:bg-white/[0.08] transition text-base font-mono flex items-center justify-center cursor-pointer"
              >
                {digit}
              </motion.button>
            ))}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend(' - ')}
              className="py-3 rounded-2xl bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30 transition text-base flex items-center justify-center cursor-pointer"
            >
              -
            </motion.button>

            {/* Row 4 */}
            {['1', '2', '3'].map((digit) => (
              <motion.button
                key={digit}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAppend(digit)}
                className="py-3 rounded-2xl bg-white/[0.04] text-white font-semibold hover:bg-white/[0.08] transition text-base font-mono flex items-center justify-center cursor-pointer"
              >
                {digit}
              </motion.button>
            ))}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend(' + ')}
              className="py-3 rounded-2xl bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30 transition text-base flex items-center justify-center cursor-pointer"
            >
              +
            </motion.button>

            {/* Row 5 */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend('0')}
              className="py-3 rounded-2xl bg-white/[0.04] text-white font-semibold hover:bg-white/[0.08] transition text-base font-mono flex items-center justify-center cursor-pointer"
            >
              0
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAppend('.')}
              className="py-3 rounded-2xl bg-white/[0.04] text-white font-semibold hover:bg-white/[0.08] transition text-base font-mono flex items-center justify-center cursor-pointer"
            >
              .
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (calculatedResult !== null) {
                  setExpression(String(calculatedResult));
                }
              }}
              className="py-3 rounded-2xl bg-indigo-500/25 text-indigo-300 font-bold hover:bg-indigo-500/35 transition text-base flex items-center justify-center cursor-pointer"
            >
              =
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleApply}
              disabled={calculatedResult === null && isNaN(parseFloat(expression))}
              className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Use</span>
            </motion.button>
          </div>

          {/* Large Prominent "Use Result" Button */}
          <div className="mt-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              disabled={calculatedResult === null && isNaN(parseFloat(expression))}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(59,130,246,0.35)] transition cursor-pointer border border-blue-400/30"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Use Result ({currencySymbol}{calculatedResult !== null ? calculatedResult.toLocaleString() : (expression || '0')})</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
