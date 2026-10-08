import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { ExpensesView } from './components/ExpensesView';
import { IncomeView } from './components/IncomeView';
import { PlanView } from './components/PlanView';
import { CalculatorView } from './components/CalculatorView';
import { SettingsView } from './components/SettingsView';
import { LogModal } from './components/LogModal';
import { Footer } from './components/Footer';
import { 
  ActiveTab, 
  AppSettings, 
  CategoryBudget, 
  IncomePlan, 
  PlanItem, 
  Transaction, 
  TransactionType 
} from './types';
import { 
  INITIAL_EXPENSE_CATEGORIES, 
  INITIAL_INCOME_PLANS, 
  INITIAL_SETTINGS, 
  INITIAL_TRANSACTIONS,
  INITIAL_MONTHLY_PLAN
} from './data/initialData';
import { 
  initAndSeedDatabase, 
  dbGetAllTransactions,
  dbSaveTransaction, 
  dbDeleteTransaction, 
  dbGetMonthlyPlan, 
  dbSaveMonthlyPlan, 
  dbGetSettings,
  dbSaveSettings, 
  resetAllLocalData 
} from './db/indexedDB';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Month navigation state (defaults to October 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(9); // 9 = October

  // Database loaded state
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);

  // Core financial state stored in IndexedDB
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenseCategories, setExpenseCategories] = useState<CategoryBudget[]>(INITIAL_EXPENSE_CATEGORIES);
  const [incomePlans, setIncomePlans] = useState<IncomePlan[]>(INITIAL_INCOME_PLANS);
  const [monthlyPlanItems, setMonthlyPlanItems] = useState<PlanItem[]>(INITIAL_MONTHLY_PLAN);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');

  // Calculator handoff states
  const [prefilledExpenseAmount, setPrefilledExpenseAmount] = useState<number | undefined>(undefined);
  const [prefilledIncomeAmount, setPrefilledIncomeAmount] = useState<number | undefined>(undefined);

  // Selected Month Key for IndexedDB partitioning (e.g. "2026-10")
  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthDisplay = `${MONTH_NAMES[currentMonthIndex]} ${currentYear}`;

  /* =========================================================================
     INDEXEDDB INITIALIZATION ON MOUNT
     ========================================================================= */
  useEffect(() => {
    let isMounted = true;

    const bootstrapData = async () => {
      try {
        const seeded = await initAndSeedDatabase();
        if (isMounted) {
          setTransactions(seeded.transactions);
          setMonthlyPlanItems(seeded.monthlyPlan);
          setSettings(seeded.settings);
          setIsDbLoaded(true);
        }
      } catch (err) {
        console.warn('Storage initialization fallback:', err);
        if (isMounted) {
          setIsDbLoaded(true);
        }
      }
    };

    bootstrapData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================================
     LOAD OR INITIALIZE MONTHLY PLAN WHEN MONTH CHANGES
     ========================================================================= */
  useEffect(() => {
    if (!isDbLoaded) return;

    const loadPlanForMonth = async () => {
      try {
        const savedPlan = await dbGetMonthlyPlan(currentMonthKey);
        if (savedPlan && savedPlan.length > 0) {
          setMonthlyPlanItems(savedPlan);
        } else {
          // Inherit the default plan template for new months and save to IndexedDB
          await dbSaveMonthlyPlan(currentMonthKey, INITIAL_MONTHLY_PLAN);
          setMonthlyPlanItems(INITIAL_MONTHLY_PLAN);
        }
      } catch {
        // Safe fallback
      }
    };

    loadPlanForMonth();
  }, [currentMonthKey, isDbLoaded]);

  /* =========================================================================
     THEME / APPEARANCE EFFECT (Requirement 6: System / Light / Dark)
     ========================================================================= */
  useEffect(() => {
    const appearance = settings.appearance || 'system';

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
    };

    if (appearance === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mql.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      applyTheme(appearance === 'dark');
    }
  }, [settings.appearance]);

  /* =========================================================================
     MONTH NAVIGATION HANDLERS
     ========================================================================= */
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  /* =========================================================================
     ACCURATE MONTH FILTERING (Only transactions belonging to this month)
     ========================================================================= */
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthKey));

  // Aggregated totals computed from actual stored records for this month
  const totalIncomePlanned = monthlyPlanItems
    .filter((p) => p.type === 'income')
    .reduce((sum, p) => sum + p.plannedAmount, 0);

  const actualIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const plannedExpenses = monthlyPlanItems
    .filter((p) => p.type === 'expense')
    .reduce((sum, p) => sum + p.plannedAmount, 0);

  const actualExpenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Planned Savings & Expected Balance
  const plannedSavings = monthlyPlanItems
    .filter((p) => p.type === 'savings')
    .reduce((sum, p) => sum + p.plannedAmount, 0);

  // Dynamic Actual Savings calculation based on stored transactions for the month
  const savingsTransactionsTotal = currentMonthTransactions
    .filter((t) => {
      const cat = (t.category || '').toLowerCase();
      return cat.includes('saving') || cat.includes('invest') || cat.includes('mutual') || cat.includes('stock');
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const actualSavings = savingsTransactionsTotal > 0
    ? savingsTransactionsTotal
    : Math.max(0, actualIncome - actualExpenses);

  const expectedBalance = Math.max(0, totalIncomePlanned - plannedExpenses - plannedSavings);

  /* =========================================================================
     PERSISTENT TRANSACTION HANDLERS (Saves to IndexedDB immediately)
     ========================================================================= */
  const handleOpenExpenseModal = () => {
    setActiveTab('expenses');
  };

  const handleOpenIncomeModal = () => {
    setActiveTab('income');
  };

  const handleOpenCalculator = () => {
    setActiveTab('calculator');
  };

  const handleAddTransaction = async (newTxData: {
    type: TransactionType;
    amount: number;
    category: any;
    description: string;
    date: string;
    paymentMethod: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      createdAt: Date.now(),
      ...newTxData,
    };

    // Update state immediately
    setTransactions((prev) => [newTx, ...prev]);

    // Save to IndexedDB immediately
    try {
      await dbSaveTransaction(newTx);
    } catch (err) {
      console.error('Failed to persist transaction to IndexedDB:', err);
    }
  };

  const handleAddExpense = (newExpense: {
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => {
    handleAddTransaction({
      type: 'expense',
      ...newExpense,
    });
  };

  const handleEditExpense = async (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );

    try {
      await dbSaveTransaction(updatedTx);
    } catch (err) {
      console.error('Failed to update expense in IndexedDB:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    try {
      await dbDeleteTransaction(id);
    } catch (err) {
      console.error('Failed to delete expense from IndexedDB:', err);
    }
  };

  const handleAddIncome = (newIncome: {
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => {
    handleAddTransaction({
      type: 'income',
      ...newIncome,
    });
  };

  const handleEditIncome = async (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );

    try {
      await dbSaveTransaction(updatedTx);
    } catch (err) {
      console.error('Failed to update income in IndexedDB:', err);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    try {
      await dbDeleteTransaction(id);
    } catch (err) {
      console.error('Failed to delete income from IndexedDB:', err);
    }
  };

  /* =========================================================================
     PERSISTENT MONTHLY PLAN HANDLERS
     ========================================================================= */
  const handleUpdatePlanItem = async (item: PlanItem) => {
    const updated = monthlyPlanItems.some((p) => p.id === item.id)
      ? monthlyPlanItems.map((p) => (p.id === item.id ? item : p))
      : [...monthlyPlanItems, item];

    setMonthlyPlanItems(updated);

    try {
      await dbSaveMonthlyPlan(currentMonthKey, updated);
    } catch (err) {
      console.error('Failed to persist monthly plan to IndexedDB:', err);
    }
  };

  const handleDeletePlanItem = async (id: string) => {
    const filtered = monthlyPlanItems.filter((p) => p.id !== id);
    setMonthlyPlanItems(filtered);

    try {
      await dbSaveMonthlyPlan(currentMonthKey, filtered);
    } catch (err) {
      console.error('Failed to delete plan item from IndexedDB:', err);
    }
  };

  /* =========================================================================
     PERSISTENT SETTINGS & RESET HANDLERS
     ========================================================================= */
  const handleUpdateSettings = async (newSettingsPartial: Partial<AppSettings>) => {
    const updated: AppSettings = {
      ...settings,
      ...newSettingsPartial,
    };
    setSettings(updated);

    try {
      await dbSaveSettings(updated);
    } catch (err) {
      console.error('Failed to persist settings to IndexedDB:', err);
    }
  };

  const handleResetData = async () => {
    try {
      await resetAllLocalData();
      const fresh = await initAndSeedDatabase();
      setTransactions(fresh.transactions);
      setMonthlyPlanItems(fresh.monthlyPlan);
      setSettings(fresh.settings);
    } catch {
      setTransactions(INITIAL_TRANSACTIONS);
      setMonthlyPlanItems(INITIAL_MONTHLY_PLAN);
      setSettings(INITIAL_SETTINGS);
    }
  };

  /* =========================================================================
     RESTORE DATA REFRESH HANDLER
     ========================================================================= */
  const handleDataRestored = async () => {
    try {
      const allTx = await dbGetAllTransactions();
      setTransactions(allTx);

      const plan = await dbGetMonthlyPlan(currentMonthKey);
      if (plan && plan.length > 0) {
        setMonthlyPlanItems(plan);
      }

      const st = await dbGetSettings();
      if (st) {
        setSettings(st);
      }
    } catch (err) {
      console.error('Failed to reload restored data:', err);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#090d16] flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Lightweight subtle background gradient (No GPU-choking blur orbs) */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#090d16] to-[#090d16]" 
        aria-hidden="true" 
      />

      {/* Top Glass Header */}
      <Header
        currentMonth={currentMonthDisplay}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        settings={settings}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Navigation Tab Bar (Desktop Segmented Bar & Mobile Dock) */}
      <Navigation activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Container - Instant Tab Rendering (Fast > Animated) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-3">
        {activeTab === 'overview' && (
          <OverviewView
            currentMonth={currentMonthDisplay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            totalIncome={totalIncomePlanned}
            actualIncome={actualIncome}
            plannedExpenses={plannedExpenses}
            actualExpenses={actualExpenses}
            plannedSavings={plannedSavings}
            actualSavings={actualSavings}
            expectedBalance={expectedBalance}
            recentTransactions={currentMonthTransactions}
            settings={settings}
            onOpenExpenseModal={handleOpenExpenseModal}
            onOpenIncomeModal={handleOpenIncomeModal}
            onNavigateToExpenses={() => setActiveTab('expenses')}
            onNavigateToIncome={() => setActiveTab('income')}
            onNavigateToPlan={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            currentMonth={currentMonthDisplay}
            plannedExpenses={plannedExpenses}
            actualExpenses={actualExpenses}
            categories={expenseCategories}
            transactions={currentMonthTransactions}
            settings={settings}
            initialAmount={prefilledExpenseAmount}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            currentMonth={currentMonthDisplay}
            totalIncome={totalIncomePlanned}
            actualIncome={actualIncome}
            incomePlans={incomePlans}
            transactions={currentMonthTransactions}
            settings={settings}
            initialAmount={prefilledIncomeAmount}
            onAddIncome={handleAddIncome}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            currentMonth={currentMonthDisplay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            monthlyPlanItems={monthlyPlanItems}
            transactions={currentMonthTransactions}
            settings={settings}
            onUpdatePlanItem={handleUpdatePlanItem}
            onDeletePlanItem={handleDeletePlanItem}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorView
            settings={settings}
            defaultMonthlyIncome={totalIncomePlanned}
            onSendToExpense={(amount) => {
              setPrefilledExpenseAmount(amount);
              setActiveTab('expenses');
            }}
            onSendToIncome={(amount) => {
              setPrefilledIncomeAmount(amount);
              setActiveTab('income');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
            onDataRestored={handleDataRestored}
          />
        )}
      </main>

      {/* Watermark / Footer with Paras Panchal credit & LinkedIn hyperlink */}
      <Footer className="hidden sm:block" />

      {/* Extra spacing for mobile dock bar */}
      <div className="h-16 sm:hidden">
        <Footer />
      </div>

      {/* Transaction Logging Modal */}
      <LogModal
        isOpen={isModalOpen}
        initialType={modalType}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
        settings={settings}
      />
    </div>
  );
}
