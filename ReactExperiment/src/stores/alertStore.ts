import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { PriceAlert, AlertCondition } from '../types/alert';

interface AlertStore {
  alerts: PriceAlert[];
  highlightedAlerts: Set<string>;
  isLoaded: boolean;
  addAlert: (symbol: string, condition: AlertCondition, threshold: number) => void;
  removeAlert: (id: string) => void;
  updateAlertTrigger: (id: string) => void;
  highlightAlert: (id: string) => void;
  unhighlightAlert: (id: string) => void;
  loadAlerts: () => Promise<void>;
}

const STORAGE_KEY = 'stock-alerts';

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  highlightedAlerts: new Set(),
  isLoaded: false,

  addAlert: (symbol: string, condition: AlertCondition, threshold: number) => {
    const newAlert: PriceAlert = {
      id: `${Date.now()}-${Math.random()}`,
      symbol: symbol.toUpperCase(),
      condition,
      threshold,
      createdAt: Date.now(),
    };

    const updatedAlerts = [...get().alerts, newAlert];
    set({ alerts: updatedAlerts });

    // Persist to IndexedDB
    idbSet(STORAGE_KEY, updatedAlerts);
  },

  removeAlert: (id: string) => {
    const updatedAlerts = get().alerts.filter((alert) => alert.id !== id);
    set({ alerts: updatedAlerts });

    // Persist to IndexedDB
    idbSet(STORAGE_KEY, updatedAlerts);
  },

  updateAlertTrigger: (id: string) => {
    const updatedAlerts = get().alerts.map((alert) =>
      alert.id === id
        ? { ...alert, lastTriggeredAt: Date.now() }
        : alert
    );
    set({ alerts: updatedAlerts });

    // Persist to IndexedDB
    idbSet(STORAGE_KEY, updatedAlerts);
  },

  highlightAlert: (id: string) => {
    const highlighted = new Set(get().highlightedAlerts);
    highlighted.add(id);
    set({ highlightedAlerts: highlighted });
  },

  unhighlightAlert: (id: string) => {
    const highlighted = new Set(get().highlightedAlerts);
    highlighted.delete(id);
    set({ highlightedAlerts: highlighted });
  },

  loadAlerts: async () => {
    try {
      const storedAlerts = await idbGet(STORAGE_KEY);
      if (storedAlerts) {
        set({ alerts: storedAlerts, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load alerts from IndexedDB:', error);
      set({ isLoaded: true });
    }
  },
}));
