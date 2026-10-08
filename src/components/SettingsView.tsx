import React from 'react';
import { 
  Settings as SettingsIcon, 
  Coins, 
  Moon, 
  Sun, 
  Monitor,
  Calendar, 
  RotateCcw, 
  Linkedin, 
  User, 
  ShieldCheck, 
  Heart,
  ExternalLink,
  Sparkles,
  Check
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { BackupRestoreSection } from './BackupRestoreSection';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetData: () => void;
  onDataRestored?: () => Promise<void> | void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', placement: 'before' as const },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', placement: 'before' as const },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', placement: 'before' as const },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', placement: 'before' as const },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)', placement: 'before' as const },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)', placement: 'before' as const },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', placement: 'before' as const },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onDataRestored = () => {},
}) => {
  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div className="px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          Preferences & System
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize currency, appearance, and financial cycle parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Preference */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Default Currency</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Select the currency symbol used across all cards and calculations.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {CURRENCIES.map((curr) => {
              const isSelected = settings.currency.code === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      currency: {
                        symbol: curr.symbol,
                        code: curr.code,
                        placement: curr.placement,
                      },
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-400/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                      : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">{curr.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    {curr.code}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Budget Cycle & Appearance */}
        <div className="space-y-6">
          {/* Appearance Section (Requirement 6) */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Appearance</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3.5">
              Choose your interface theme or automatically follow your device settings.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'system', label: 'System', icon: Monitor, desc: 'Auto device' },
                { id: 'light', label: 'Light', icon: Sun, desc: 'Crisp glass' },
                { id: 'dark', label: 'Dark', icon: Moon, desc: 'VisionOS glass' },
              ].map((opt) => {
                const currentVal = settings.appearance || 'system';
                const isSelected = currentVal === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ 
                        appearance: opt.id as 'system' | 'light' | 'dark',
                        themeMode: opt.id === 'light' ? 'light-glass' : 'dark-glass'
                      });
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-400/60 text-white shadow-sm'
                        : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-bold text-white">Monthly Cycle Start</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              The day of the month your salary or fresh budget cycle resets.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 15, 25].map((day) => {
                const isSelected = settings.monthlyCycleDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onUpdateSettings({ monthlyCycleDay: day })}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-sm font-bold block">{day}st</span>
                    <span className="text-[9px] text-slate-400 uppercase mt-0.5 block">
                      Day
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Reset Demo Data */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Reset Demo Financial Data</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Restore default balances and categories for preview
                </p>
              </div>
              <button
                type="button"
                onClick={onResetData}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
              >
                Reset
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <BackupRestoreSection
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onDataRestored={onDataRestored}
      />

      {/* Creator & Branding Spotlight Card */}
      <GlassCard variant="glow-blue" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  My Budget Tracker
                </h3>
                <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
                  v1.0 Design Preview
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                <span>Designed & built by</span>
                <span className="font-semibold text-white">Paras Panchal</span>
              </p>
            </div>
          </div>

          <a
            href="https://www.linkedin.com/in/paras-panchal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 border border-[#0a66c2]/40 text-blue-200 text-xs font-semibold transition-all shadow-sm group"
          >
            <Linkedin className="w-4 h-4 fill-current text-blue-400" />
            <span>Connect on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </GlassCard>
    </div>
  );
};
