import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, Wallet } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  settings,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-950/70 border-b border-white/10 transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3.5 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <div className="w-full h-full bg-slate-950/90 rounded-[11px] flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>My Budget Tracker</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Apple-inspired Personal Finance
            </p>
          </div>
        </div>

        {/* Current Month Navigator (Apple segmented glass capsule) */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-xl shadow-inner">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous Month"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs sm:text-sm font-semibold text-slate-100 font-mono tracking-tight">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{currentMonth}</span>
          </div>

          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next Month"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Settings button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
