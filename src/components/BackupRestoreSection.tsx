import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Upload, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Lock,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AppSettings, BackupData } from '../types';
import { 
  dbExportAllData, 
  validateBackupData, 
  dbRestoreAllData 
} from '../db/indexedDB';

interface BackupRestoreSectionProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onDataRestored: () => Promise<void> | void;
}

export const BackupRestoreSection: React.FC<BackupRestoreSectionProps> = ({
  settings,
  onUpdateSettings,
  onDataRestored,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Restore States
  const [pendingBackupData, setPendingBackupData] = useState<BackupData | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [pendingStats, setPendingStats] = useState<{
    txCount: number;
    planCount: number;
    categoriesCount: number;
    exportedDate?: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreSuccessMessage, setRestoreSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate formatted date filename: My-Budget-Tracker-Backup-YYYY-MM-DD.json
  const getBackupFilename = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `My-Budget-Tracker-Backup-${year}-${month}-${day}.json`;
  };

  /* =========================================================================
     EXPORT BACKUP HANDLER
     ========================================================================= */
  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      setErrorMessage(null);
      setExportSuccessMessage(null);

      // Export all data from IndexedDB
      const backupData = await dbExportAllData();

      // Convert to JSON string
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const filename = getBackupFilename();
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const todayStr = new Date().toISOString().split('T')[0];
      onUpdateSettings({ lastBackupDate: todayStr });

      setExportSuccessMessage(`Backup saved: ${filename}`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to export backup:', err);
      setErrorMessage('Could not generate backup file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /* =========================================================================
     RESTORE FILE SELECT HANDLER
     ========================================================================= */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setRestoreSuccessMessage(null);
    setPendingFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMessage('The selected file is empty.');
          return;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          setErrorMessage('Invalid file format. The selected file is not a valid JSON document.');
          return;
        }

        const validation = validateBackupData(parsed);
        if (!validation.valid) {
          setErrorMessage(validation.error || 'This file is not a valid My Budget Tracker backup.');
          return;
        }

        // Valid backup ready for confirmation
        const txCount = Array.isArray(parsed.transactions) ? parsed.transactions.length : 0;
        const planCount = Array.isArray(parsed.monthlyPlans) ? parsed.monthlyPlans.length : 0;
        const categoriesCount = Array.isArray(parsed.customCategories) ? parsed.customCategories.length : 0;
        const exportedDate = parsed.exportedAt 
          ? new Date(parsed.exportedAt).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          : undefined;

        setPendingBackupData(parsed as BackupData);
        setPendingStats({
          txCount,
          planCount,
          categoriesCount,
          exportedDate,
        });
        setIsConfirmModalOpen(true);
      } catch (err) {
        console.error('File parsing error:', err);
        setErrorMessage('Unable to read the backup file.');
      } finally {
        // Reset file input so user can pick the same file again if desired
        if (event.target) {
          event.target.value = '';
        }
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read the selected backup file from your device.');
    };

    reader.readAsText(file);
  };

  /* =========================================================================
     CONFIRM AND EXECUTE RESTORE
     ========================================================================= */
  const handleConfirmRestore = async () => {
    if (!pendingBackupData) return;

    try {
      setIsRestoring(true);
      setErrorMessage(null);

      // Restore data to IndexedDB
      await dbRestoreAllData(pendingBackupData);

      // Refresh Overview, Income, and Expense data across the application
      await onDataRestored();

      setIsConfirmModalOpen(false);
      setPendingBackupData(null);
      setPendingStats(null);
      setRestoreSuccessMessage('Backup successfully restored! All calculations & transactions updated.');
      setTimeout(() => setRestoreSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Failed to restore backup:', err);
      setErrorMessage('Failed to restore backup data to local storage.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancelRestore = () => {
    setIsConfirmModalOpen(false);
    setPendingBackupData(null);
    setPendingStats(null);
  };

  return (
    <div className="space-y-4">
      <GlassCard variant="default">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Backup & Restore
              </h3>
              <p className="text-xs text-slate-400">
                Safe, private local backup of all transactions, plans, and custom categories.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note Badge */}
        <div className="mt-3 mb-5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-emerald-300">100% Client-Side Privacy: </span>
            Backups are created directly on your device. Your financial data is never sent to or stored on any server.
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-rose-200 text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Restore Notice</p>
              <p className="text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Export Success Notification */}
        {exportSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-200 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1">{exportSuccessMessage}</span>
          </motion.div>
        )}

        {/* Restore Success Notification */}
        {restoreSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-200 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{restoreSuccessMessage}</span>
          </motion.div>
        )}

        {/* Action Buttons: Export & Restore */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* Export Backup Button */}
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="p-4 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-left transition-colors shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20">
                JSON File
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {isExporting ? 'Generating Backup...' : 'Export Backup'}
              </span>
              <span className="text-[11px] text-slate-300/80 mt-0.5 block leading-relaxed">
                Download a complete copy of all your financial data to your device.
              </span>
            </div>
          </button>

          {/* Restore Backup Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-white/10 hover:border-white/20 text-left transition-colors shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-slate-200">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  Select File
                </span>
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Restore Backup
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed">
                  Upload an exported JSON file to restore your transactions and budget.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Backup Reminder Setting */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Backup Reminder</h4>
                <p className="text-[11px] text-slate-400">
                  Gentle reminder prompt to export your budget data
                </p>
              </div>
            </div>
            {settings.lastBackupDate && (
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                Last backup: {settings.lastBackupDate}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['off', 'weekly', 'monthly'] as const).map((mode) => {
              const isSelected = (settings.backupReminder || 'off') === mode;
              const labels = {
                off: 'Off',
                weekly: 'Weekly',
                monthly: 'Monthly',
              };
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdateSettings({ backupReminder: mode })}
                  className={`py-2 px-3 rounded-xl border text-center transition-colors text-xs font-semibold ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-400/50 text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Confirmation Modal for Restore */}
      <AnimatePresence>
        {isConfirmModalOpen && pendingBackupData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelRestore}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-slate-900/90 border border-white/20 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-10"
            >
              {/* Apple Specular Top Highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirm Restore
                  </h3>
                  <p className="text-xs text-slate-400">
                    File: <span className="text-slate-200 font-mono">{pendingFileName}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 space-y-2 text-xs">
                <p className="text-slate-200 leading-relaxed font-medium">
                  This will restore your saved budget data. Continue?
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="block text-[10px] text-slate-400">Transactions</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {pendingStats?.txCount ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="block text-[10px] text-slate-400">Monthly Plans</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {pendingStats?.planCount ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="block text-[10px] text-slate-400">Custom Items</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {pendingStats?.categoriesCount ?? 0}
                    </span>
                  </div>
                </div>
                {pendingStats?.exportedDate && (
                  <p className="text-[10px] text-slate-400 pt-1 text-center">
                    Original backup created on: <span className="text-slate-300">{pendingStats.exportedDate}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelRestore}
                  disabled={isRestoring}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  disabled={isRestoring}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-1.5"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Restoring...</span>
                    </>
                  ) : (
                    <span>Yes, Restore Data</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
