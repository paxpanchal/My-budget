import { 
  Transaction, 
  PlanItem, 
  CategoryItem, 
  AppSettings,
  BackupData 
} from '../types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_MONTHLY_PLAN, 
  INITIAL_SETTINGS 
} from '../data/initialData';

const DB_NAME = 'MyBudgetTrackerDB';
const DB_VERSION = 1;

const STORES = {
  TRANSACTIONS: 'transactions',
  MONTHLY_PLANS: 'monthly_plans',
  CUSTOM_CATEGORIES: 'custom_categories',
  SETTINGS: 'settings',
} as const;

// Helper to check if IndexedDB is available in the current environment
const isIndexedDBAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
};

let dbInstance: IDBDatabase | null = null;

export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not supported or restricted in this environment.'));
      return;
    }

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Transactions store
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
        txStore.createIndex('category', 'category', { unique: false });
      }

      // 2. Monthly Plans store
      if (!db.objectStoreNames.contains(STORES.MONTHLY_PLANS)) {
        db.createObjectStore(STORES.MONTHLY_PLANS, { keyPath: 'monthKey' });
      }

      // 3. Custom Categories store
      if (!db.objectStoreNames.contains(STORES.CUSTOM_CATEGORIES)) {
        db.createObjectStore(STORES.CUSTOM_CATEGORIES, { keyPath: 'id' });
      }

      // 4. App Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB database.'));
    };
  });
};

/* =========================================================================
   TRANSACTIONS REPOSITORY
   ========================================================================= */

export const dbGetAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TRANSACTIONS, 'readonly');
      const store = tx.objectStore(STORES.TRANSACTIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    // LocalStorage fallback
    const raw = localStorage.getItem('mbt_transactions');
    return raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
  }
};

export const dbSaveTransaction = async (transaction: Transaction): Promise<void> => {
  const txWithTimestamp: Transaction = {
    ...transaction,
    createdAt: transaction.createdAt || Date.now(),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.TRANSACTIONS, 'readwrite');
      const store = tx.objectStore(STORES.TRANSACTIONS);
      const request = store.put(txWithTimestamp);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // LocalStorage fallback
    const current = await dbGetAllTransactions();
    const updated = [txWithTimestamp, ...current.filter((t) => t.id !== transaction.id)];
    localStorage.setItem('mbt_transactions', JSON.stringify(updated));
  }
};

export const dbDeleteTransaction = async (id: string): Promise<void> => {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.TRANSACTIONS, 'readwrite');
      const store = tx.objectStore(STORES.TRANSACTIONS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // LocalStorage fallback
    const current = await dbGetAllTransactions();
    const updated = current.filter((t) => t.id !== id);
    localStorage.setItem('mbt_transactions', JSON.stringify(updated));
  }
};

/* =========================================================================
   MONTHLY PLANS REPOSITORY
   ========================================================================= */

export const dbGetMonthlyPlan = async (monthKey: string): Promise<PlanItem[] | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MONTHLY_PLANS, 'readonly');
      const store = tx.objectStore(STORES.MONTHLY_PLANS);
      const request = store.get(monthKey);

      request.onsuccess = () => {
        if (request.result && request.result.items) {
          resolve(request.result.items);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem(`mbt_plan_${monthKey}`);
    return raw ? JSON.parse(raw) : null;
  }
};

export const dbSaveMonthlyPlan = async (monthKey: string, items: PlanItem[]): Promise<void> => {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.MONTHLY_PLANS, 'readwrite');
      const store = tx.objectStore(STORES.MONTHLY_PLANS);
      const request = store.put({ monthKey, items, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    localStorage.setItem(`mbt_plan_${monthKey}`, JSON.stringify(items));
  }
};

export const dbGetAllMonthlyPlans = async (): Promise<{ monthKey: string; items: PlanItem[]; updatedAt?: number }[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MONTHLY_PLANS, 'readonly');
      const store = tx.objectStore(STORES.MONTHLY_PLANS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    // LocalStorage fallback: search keys
    const plans: { monthKey: string; items: PlanItem[]; updatedAt?: number }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mbt_plan_')) {
          const monthKey = key.replace('mbt_plan_', '');
          const raw = localStorage.getItem(key);
          if (raw) {
            plans.push({ monthKey, items: JSON.parse(raw) });
          }
        }
      }
    } catch {
      // Ignore
    }
    return plans;
  }
};
export const dbGetMostRecentPlanBeforeMonth = async (targetMonthKey: string): Promise<PlanItem[] | null> => {
  try {
    const allPlans = await dbGetAllMonthlyPlans();
    if (!allPlans || allPlans.length === 0) return null;

    // Filter plans strictly before targetMonthKey in chronological YYYY-MM order
    const priorPlans = allPlans
      .filter((p) => p.monthKey < targetMonthKey && Array.isArray(p.items) && p.items.length > 0)
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey)); // descending: closest prior month first

    if (priorPlans.length > 0) {
      return priorPlans[0].items;
    }
    return null;
  } catch {
    return null;
  }
};

/* =========================================================================
   CUSTOM CATEGORIES REPOSITORY
   ========================================================================= */

export const dbGetCustomCategories = async (): Promise<CategoryItem[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOM_CATEGORIES, 'readonly');
      const store = tx.objectStore(STORES.CUSTOM_CATEGORIES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem('mbt_custom_categories');
    return raw ? JSON.parse(raw) : [];
  }
};

export const dbSaveCustomCategory = async (category: CategoryItem): Promise<void> => {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOM_CATEGORIES, 'readwrite');
      const store = tx.objectStore(STORES.CUSTOM_CATEGORIES);
      const request = store.put(category);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = await dbGetCustomCategories();
    const updated = [...current.filter((c) => c.id !== category.id), category];
    localStorage.setItem('mbt_custom_categories', JSON.stringify(updated));
  }
};

/* =========================================================================
   SETTINGS REPOSITORY
   ========================================================================= */

export const dbGetSettings = async (): Promise<AppSettings | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.get('app_settings');

      request.onsuccess = () => {
        if (request.result && request.result.data) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem('mbt_settings');
    return raw ? JSON.parse(raw) : null;
  }
};

export const dbSaveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.put({ id: 'app_settings', data: settings, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    localStorage.setItem('mbt_settings', JSON.stringify(settings));
  }
};

/* =========================================================================
   DATABASE INITIALIZATION & SEEDING
   ========================================================================= */

export const initAndSeedDatabase = async (): Promise<{
  transactions: Transaction[];
  monthlyPlan: PlanItem[];
  customCategories: CategoryItem[];
  settings: AppSettings;
}> => {
  try {
    // 1. Get or seed Settings
    let settings = await dbGetSettings();
    if (!settings) {
      settings = INITIAL_SETTINGS;
      await dbSaveSettings(settings);
    }

    // 2. Get Transactions (preserves existing user data, empty [] for new users)
    let transactions = await dbGetAllTransactions();
    if (!transactions) {
      transactions = [];
    }

    // 3. Get Monthly Plan for active month (preserves existing user data, empty [] for new users)
    const defaultMonthKey = '2026-10';
    let monthlyPlan = await dbGetMonthlyPlan(defaultMonthKey);
    if (!monthlyPlan) {
      monthlyPlan = [];
    }

    // 4. Get custom categories
    const customCategories = await dbGetCustomCategories();

    return {
      transactions,
      monthlyPlan,
      customCategories,
      settings,
    };
  } catch (error) {
    console.warn('Database initialization warning, using default seed:', error);
    return {
      transactions: INITIAL_TRANSACTIONS,
      monthlyPlan: INITIAL_MONTHLY_PLAN,
      customCategories: [],
      settings: INITIAL_SETTINGS,
    };
  }
};

export const resetAllLocalData = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    const stores = [STORES.TRANSACTIONS, STORES.MONTHLY_PLANS, STORES.CUSTOM_CATEGORIES, STORES.SETTINGS];
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach((storeName) => {
        tx.objectStore(storeName).clear();
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.clear();
  }

  // Re-seed with fresh defaults
  await initAndSeedDatabase();
};

/* =========================================================================
   BACKUP & RESTORE REPOSITORY
   ========================================================================= */

/**
 * Exports all user data from IndexedDB into a single comprehensive backup structure.
 */
export const dbExportAllData = async (): Promise<BackupData> => {
  const transactions = await dbGetAllTransactions();
  const monthlyPlans = await dbGetAllMonthlyPlans();
  const customCategories = await dbGetCustomCategories();
  const settings = (await dbGetSettings()) || INITIAL_SETTINGS;

  const backup: BackupData = {
    version: 1,
    appName: 'My Budget Tracker',
    exportedAt: new Date().toISOString(),
    transactions,
    monthlyPlans,
    customCategories,
    settings,
  };

  return backup;
};

/**
 * Validates the contents of a parsed JSON file to ensure it's a valid My Budget Tracker backup.
 */
export const validateBackupData = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'The selected file is empty or does not contain valid JSON data.' };
  }

  // Check signature / app identifier
  if (data.appName !== 'My Budget Tracker' && !data.transactions && !data.monthlyPlans) {
    return { 
      valid: false, 
      error: 'Invalid file format. This file does not appear to be a valid "My Budget Tracker" backup.' 
    };
  }

  // Validate transactions array if present
  if (data.transactions !== undefined && !Array.isArray(data.transactions)) {
    return { valid: false, error: 'Corrupted backup file: "transactions" must be a list of records.' };
  }

  if (Array.isArray(data.transactions)) {
    for (const tx of data.transactions) {
      if (!tx || typeof tx !== 'object' || typeof tx.id !== 'string' || typeof tx.amount !== 'number' || typeof tx.date !== 'string') {
        return { valid: false, error: 'Corrupted backup: one or more transaction entries are invalid.' };
      }
    }
  }

  // Validate monthlyPlans if present
  if (data.monthlyPlans !== undefined && !Array.isArray(data.monthlyPlans)) {
    return { valid: false, error: 'Corrupted backup file: "monthlyPlans" must be a list of plans.' };
  }

  // Validate customCategories if present
  if (data.customCategories !== undefined && !Array.isArray(data.customCategories)) {
    return { valid: false, error: 'Corrupted backup file: "customCategories" must be a list of categories.' };
  }

  return { valid: true };
};

/**
 * Clears current data and restores all data from the validated BackupData into IndexedDB.
 */
export const dbRestoreAllData = async (backup: BackupData): Promise<{
  transactions: Transaction[];
  monthlyPlan: PlanItem[];
  customCategories: CategoryItem[];
  settings: AppSettings;
}> => {
  try {
    const db = await openDatabase();
    const stores = [STORES.TRANSACTIONS, STORES.MONTHLY_PLANS, STORES.CUSTOM_CATEGORIES, STORES.SETTINGS];
    
    // Clear existing data cleanly
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach((storeName) => {
        tx.objectStore(storeName).clear();
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Populate transactions
    if (backup.transactions && backup.transactions.length > 0) {
      const tx = db.transaction(STORES.TRANSACTIONS, 'readwrite');
      const store = tx.objectStore(STORES.TRANSACTIONS);
      for (const t of backup.transactions) {
        store.put(t);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    // Populate monthly plans
    if (backup.monthlyPlans && backup.monthlyPlans.length > 0) {
      const tx = db.transaction(STORES.MONTHLY_PLANS, 'readwrite');
      const store = tx.objectStore(STORES.MONTHLY_PLANS);
      for (const p of backup.monthlyPlans) {
        store.put(p);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    // Populate custom categories
    if (backup.customCategories && backup.customCategories.length > 0) {
      const tx = db.transaction(STORES.CUSTOM_CATEGORIES, 'readwrite');
      const store = tx.objectStore(STORES.CUSTOM_CATEGORIES);
      for (const c of backup.customCategories) {
        store.put(c);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    // Populate settings
    const restoredSettings = backup.settings || INITIAL_SETTINGS;
    await dbSaveSettings(restoredSettings);

    // Also sync localStorage backups
    try {
      localStorage.setItem('mbt_transactions', JSON.stringify(backup.transactions || []));
      localStorage.setItem('mbt_custom_categories', JSON.stringify(backup.customCategories || []));
      localStorage.setItem('mbt_settings', JSON.stringify(restoredSettings));
      if (backup.monthlyPlans) {
        for (const mp of backup.monthlyPlans) {
          localStorage.setItem(`mbt_plan_${mp.monthKey}`, JSON.stringify(mp.items));
        }
      }
    } catch {
      // Ignore localStorage sync issues
    }

    // Prepare current month's plan
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    let currentPlan = await dbGetMonthlyPlan(currentMonthKey);
    if (!currentPlan && backup.monthlyPlans && backup.monthlyPlans.length > 0) {
      currentPlan = backup.monthlyPlans[0].items;
    }
    if (!currentPlan) {
      currentPlan = INITIAL_MONTHLY_PLAN;
    }

    return {
      transactions: backup.transactions || [],
      monthlyPlan: currentPlan,
      customCategories: backup.customCategories || [],
      settings: restoredSettings,
    };
  } catch (err) {
    // If IndexedDB failed, fallback to writing to localStorage
    console.error('IndexedDB restore failed, falling back to localStorage:', err);
    localStorage.clear();
    localStorage.setItem('mbt_transactions', JSON.stringify(backup.transactions || []));
    localStorage.setItem('mbt_custom_categories', JSON.stringify(backup.customCategories || []));
    localStorage.setItem('mbt_settings', JSON.stringify(backup.settings || INITIAL_SETTINGS));
    if (backup.monthlyPlans) {
      for (const mp of backup.monthlyPlans) {
        localStorage.setItem(`mbt_plan_${mp.monthKey}`, JSON.stringify(mp.items));
      }
    }

    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const firstPlan = backup.monthlyPlans?.[0]?.items || INITIAL_MONTHLY_PLAN;

    return {
      transactions: backup.transactions || [],
      monthlyPlan: firstPlan,
      customCategories: backup.customCategories || [],
      settings: backup.settings || INITIAL_SETTINGS,
    };
  }
};
