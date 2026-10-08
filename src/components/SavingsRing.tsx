import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

interface SavingsRingProps {
  savingsPercent: number; // e.g., 75%
  budgetSpentPercent: number; // e.g., 60%
  actualSaved: string;
  targetSaved: string;
}

export const SavingsRing: React.FC<SavingsRingProps> = ({
  savingsPercent,
  budgetSpentPercent,
  actualSaved,
  targetSaved,
}) => {
  // Clamped percentages for SVG strokeDasharray
  const clampedSavings = Math.min(Math.max(savingsPercent, 0), 100);
  const clampedBudget = Math.min(Math.max(budgetSpentPercent, 0), 100);

  // SVG Ring math
  const size = 180;
  const strokeWidth = 12;
  
  // Outer ring (Savings Goal)
  const outerRadius = (size - strokeWidth) / 2;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerStrokeDashoffset = outerCircumference - (clampedSavings / 100) * outerCircumference;

  // Inner ring (Budget spent)
  const innerStrokeWidth = 8;
  const innerRadius = outerRadius - strokeWidth - 6;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerStrokeDashoffset = innerCircumference - (clampedBudget / 100) * innerCircumference;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-1">
      {/* Visual Ring Section */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <defs>
            <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Outer Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Outer Active Progress (Savings) */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            fill="transparent"
            stroke="url(#savingsGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={outerCircumference}
            initial={{ strokeDashoffset: outerCircumference }}
            animate={{ strokeDashoffset: outerStrokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />

          {/* Inner Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={innerStrokeWidth}
          />
          {/* Inner Active Progress (Budget) */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="transparent"
            stroke="url(#budgetGradient)"
            strokeWidth={innerStrokeWidth}
            strokeDasharray={innerCircumference}
            initial={{ strokeDashoffset: innerCircumference }}
            animate={{ strokeDashoffset: innerStrokeDashoffset }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Ring Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-white font-mono"
          >
            {clampedSavings}%
          </motion.span>
          <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400 mt-0.5">
            Saved
          </span>
        </div>
      </div>

      {/* Ring Legend & Metrics */}
      <div className="flex-1 w-full flex flex-col justify-center space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span>Monthly Savings Goal</span>
            </span>
            <span className="font-mono text-emerald-300 font-semibold">{actualSaved} / {targetSaved}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedSavings}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
              <span>Expense Budget Pace</span>
            </span>
            <span className="font-mono text-blue-300 font-semibold">{clampedBudget}% Spent</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedBudget}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Healthy Budget Pace</span>
          </div>
          <span className="text-[11px] text-slate-500">25 days remaining</span>
        </div>
      </div>
    </div>
  );
};
