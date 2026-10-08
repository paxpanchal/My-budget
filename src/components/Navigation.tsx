import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  SlidersHorizontal, 
  Settings 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'plan', label: 'Plan', icon: SlidersHorizontal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Glass Tab Bar (Apple iOS Dock) */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-2.5 inset-x-0 z-40 px-3 sm:hidden flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center justify-around w-full max-w-md px-1.5 py-1 rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/90 dark:border-white/15 shadow-xl transition-colors">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors min-h-[48px] cursor-pointer ${
                  isActive 
                    ? 'text-blue-600 dark:text-white bg-blue-500/15 dark:bg-white/10 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-blue-600 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop / Tablet Segmented Glass Nav Bar */}
      <div className="hidden sm:flex justify-center max-w-4xl mx-auto px-4 sm:px-6 pt-3">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-lg w-full justify-between transition-colors">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-white bg-blue-500/15 dark:bg-blue-600/30 border border-blue-500/20 dark:border-blue-400/30 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
