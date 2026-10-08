import React, { useState } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  PiggyBank, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Check,
  X,
  Sparkles,
  Layers,
  Tag
} from 'lucide-react';
import { AppSettings, PlanItem, PlanItemType, Transaction } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getCategoryIconComponent } from '../utils/categoryIcons';

interface PlanViewProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthlyPlanItems: PlanItem[];
  transactions: Transaction[];
  settings: AppSettings;
  onUpdatePlanItem: (item: PlanItem) => void;
  onDeletePlanItem: (id: string) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  monthlyPlanItems,
  transactions,
  settings,
  onUpdatePlanItem,
  onDeletePlanItem,
}) => {
  // Accordion state: only one section expanded at a time (Requirement 2)
  const [expandedSection, setExpandedSection] = useState<'income' | 'expense' | 'savings' | null>('expense');

  // Three-dot open menu ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Delete confirmation modal state (Requirement 3)
  const [itemToDelete, setItemToDelete] = useState<PlanItem | null>(null);

  // Edit item state
  const [itemToEdit, setItemToEdit] = useState<PlanItem | null>(null);

  // Add item modal / stepper state (Requirement 4)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddType, setSelectedAddType] = useState<PlanItemType | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  // Group items by type
  const incomeItems = monthlyPlanItems.filter((i) => i.type === 'income');
  const expenseItems = monthlyPlanItems.filter((i) => i.type === 'expense');
  const savingsItems = monthlyPlanItems.filter((i) => i.type === 'savings');

  // Totals
  const totalPlannedIncome = incomeItems.reduce((acc, i) => acc + i.plannedAmount, 0);
  const totalPlannedExpenses = expenseItems.reduce((acc, i) => acc + i.plannedAmount, 0);
  const totalPlannedSavings = savingsItems.reduce((acc, i) => acc + i.plannedAmount, 0);
  const expectedMoneyLeft = Math.max(0, totalPlannedIncome - totalPlannedExpenses - totalPlannedSavings);

  // Toggle single section (Requirement 2)
  const toggleSection = (section: 'income' | 'expense' | 'savings') => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Actual spent calculation for category
  const getActualSpent = (name: string): number => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category.toLowerCase().trim() === name.toLowerCase().trim())
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getActualReceived = (name: string): number => {
    return transactions
      .filter((t) => t.type === 'income' && t.category.toLowerCase().trim() === name.toLowerCase().trim())
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Add Item Submit
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddType || !newItemName.trim() || !newItemAmount) return;

    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newItem: PlanItem = {
      id: `plan-${Date.now()}`,
      name: newItemName.trim(),
      type: selectedAddType,
      plannedAmount: amount,
      iconName: selectedAddType === 'income' ? 'TrendingUp' : selectedAddType === 'savings' ? 'PiggyBank' : 'Tag',
      color: selectedAddType === 'income' ? '#10b981' : selectedAddType === 'savings' ? '#3b82f6' : '#f59e0b',
      isCustom: true,
    };

    onUpdatePlanItem(newItem);
    // Expand the section that was just added to
    setExpandedSection(selectedAddType);

    // Reset form
    setIsAddModalOpen(false);
    setSelectedAddType(null);
    setNewItemName('');
    setNewItemAmount('');
  };

  // Save Edit Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;
    onUpdatePlanItem(itemToEdit);
    setItemToEdit(null);
  };

  return (
    <div className="space-y-5 pb-6 sm:pb-8">
      {/* 1. Header with Month Selection */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
            Budget Blueprint
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Monthly Plan · {currentMonth}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label="Previous month"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              aria-label="Next month"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedAddType(null);
              setNewItemName('');
              setNewItemAmount('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Add Item</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block">Planned Income</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">{formatCurrency(totalPlannedIncome, settings)}</span>
        </div>
        <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20">
          <span className="text-[10px] font-bold uppercase text-rose-400 block">Planned Expenses</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">{formatCurrency(totalPlannedExpenses, settings)}</span>
        </div>
        <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20">
          <span className="text-[10px] font-bold uppercase text-blue-400 block">Planned Savings</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">{formatCurrency(totalPlannedSavings, settings)}</span>
        </div>
        <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
          <span className="text-[10px] font-bold uppercase text-purple-400 block">Expected Left</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">{formatCurrency(expectedMoneyLeft, settings)}</span>
        </div>
      </div>

      {/* 3. COLLAPSIBLE ACCORDION SECTIONS (Requirement 2: Do NOT keep all expanded at the same time) */}
      <div className="space-y-3">
        {/* SECTION A: INCOME */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-sm transition">
          <button
            type="button"
            onClick={() => toggleSection('income')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Expected Income</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {incomeItems.length} items
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Total: {formatCurrency(totalPlannedIncome, settings)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 font-mono hidden sm:inline">
                {formatCurrency(totalPlannedIncome, settings)}
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                {expandedSection === 'income' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {expandedSection === 'income' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2">
              {incomeItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No planned income items yet.</p>
              ) : (
                incomeItems.map((item) => {
                  const actual = getActualReceived(item.name);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-white block truncate">{item.name}</span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Planned: <strong className="text-slate-200 font-mono">{formatCurrency(item.plannedAmount, settings)}</strong></span>
                          {actual > 0 && (
                            <span className="text-emerald-400">Actual: {formatCurrency(actual, settings)}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (Requirement 3: Edit & Delete easy to access) */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setItemToEdit(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                          title="Edit planned item"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                          title="Delete planned item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* SECTION B: EXPENSES */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-sm transition">
          <button
            type="button"
            onClick={() => toggleSection('expense')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Expected Expenses</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    {expenseItems.length} items
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Total: {formatCurrency(totalPlannedExpenses, settings)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 font-mono hidden sm:inline">
                {formatCurrency(totalPlannedExpenses, settings)}
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                {expandedSection === 'expense' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {expandedSection === 'expense' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2">
              {expenseItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No planned expense items yet.</p>
              ) : (
                expenseItems.map((item) => {
                  const actual = getActualSpent(item.name);
                  const remaining = item.plannedAmount - actual;
                  const ratio = Math.min(100, Math.round((actual / item.plannedAmount) * 100));

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-xs font-mono font-bold text-white mr-1">
                            {formatCurrency(item.plannedAmount, settings)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setItemToEdit(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                            title="Edit planned item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                            title="Delete planned item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Planned vs Actual comparison */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Actual: <strong className="text-slate-200 font-mono">{formatCurrency(actual, settings)}</strong></span>
                        <span className={remaining < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                          {remaining < 0 ? `Over by ${formatCurrency(Math.abs(remaining), settings)}` : `Left: ${formatCurrency(remaining, settings)}`}
                        </span>
                      </div>

                      {/* Small clean progress bar */}
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            ratio > 100 ? 'bg-rose-500' : ratio > 75 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* SECTION C: SAVINGS */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-sm transition">
          <button
            type="button"
            onClick={() => toggleSection('savings')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Expected Savings</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    {savingsItems.length} items
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Total: {formatCurrency(totalPlannedSavings, settings)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 font-mono hidden sm:inline">
                {formatCurrency(totalPlannedSavings, settings)}
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                {expandedSection === 'savings' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {expandedSection === 'savings' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2">
              {savingsItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No planned savings items yet.</p>
              ) : (
                savingsItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-white block truncate">{item.name}</span>
                      <span className="text-[10px] text-blue-400 font-mono block mt-0.5">
                        Target: {formatCurrency(item.plannedAmount, settings)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-blue-300 mr-1">
                        {formatCurrency(item.plannedAmount, settings)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItemToEdit(item)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="Edit planned item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                        title="Delete planned item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. SIMPLIFIED ADD ITEM MODAL (Requirement 4) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-white/20 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Add to Monthly Plan</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: What do you want to add? (Requirement 4) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                What do you want to add?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAddType('income')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedAddType === 'income'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Income</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAddType('expense')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedAddType === 'expense'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAddType('savings')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedAddType === 'savings'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <PiggyBank className="w-4 h-4" />
                  <span>Savings</span>
                </button>
              </div>
            </div>

            {/* STEP 2: ONLY AFTER SELECTING ONE DO RELEVANT FIELDS APPEAR (Requirement 4) */}
            {selectedAddType && (
              <form onSubmit={handleCreateItem} className="space-y-3 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedAddType === 'income'
                        ? 'e.g. Salary, Freelance, Dividend'
                        : selectedAddType === 'savings'
                          ? 'e.g. Emergency Fund, Stocks'
                          : 'e.g. Groceries, Gym, Wi-Fi'
                    }
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Planned Monthly Amount ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0.00"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. EDIT PLANNED ITEM MODAL */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-white/20 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Planned Item</h3>
              <button
                type="button"
                onClick={() => setItemToEdit(null)}
                className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={itemToEdit.name}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Planned Amount ({settings.currency.symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={itemToEdit.plannedAmount}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, plannedAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION DIALOG (Requirement 3: "Delete this planned item?" Cancel | Delete) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-xs rounded-2xl bg-slate-900 border border-white/20 p-5 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete this planned item?</h3>
              <p className="text-xs text-slate-400 mt-1 truncate">
                "{itemToDelete.name}" ({formatCurrency(itemToDelete.plannedAmount, settings)})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePlanItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
