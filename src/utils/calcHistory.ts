export interface CalcHistoryItem {
  id: string;
  expression: string;
  result: number;
  timestamp: string;
}

const STORAGE_KEY = 'my_budget_tracker_calc_history';

export const INITIAL_CALC_HISTORY: CalcHistoryItem[] = [
  {
    id: 'calc-1',
    expression: '250 + 120',
    result: 370,
    timestamp: 'Just now',
  },
  {
    id: 'calc-2',
    expression: '500 - 150',
    result: 350,
    timestamp: 'Today',
  },
  {
    id: 'calc-3',
    expression: '50000 - 5000',
    result: 45000,
    timestamp: 'Today',
  },
  {
    id: 'calc-4',
    expression: '1200 + 450 + 80',
    result: 1730,
    timestamp: 'Yesterday',
  },
];

export const getStoredCalcHistory = (): CalcHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_CALC_HISTORY;
};

export const saveCalcHistoryItem = (expression: string, result: number): CalcHistoryItem[] => {
  try {
    const current = getStoredCalcHistory();
    const newItem: CalcHistoryItem = {
      id: `calc-${Date.now()}`,
      expression: expression.trim(),
      result: Math.round(result * 100) / 100,
      timestamp: 'Just now',
    };
    // Keep latest 10 calculations
    const updated = [newItem, ...current.filter((c) => c.expression !== newItem.expression)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_CALC_HISTORY;
  }
};

export const clearStoredCalcHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fallback
  }
};
