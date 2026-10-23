import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS, Theme } from '../types/settings';
import { db, initializeDatabaseDefaults } from '../lib/db';
import { getLocalToday, shiftDate } from '../lib/dates';
import { useLiveClock } from '../hooks/useLiveClock';

interface AppContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedWeekRefDate: string;
  setSelectedWeekRefDate: (date: string) => void;
  jumpToToday: () => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  todayDateStr: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clock = useLiveClock((newDate) => {
    // When midnight passes, automatically advance selected date to new day if user was on today
    setSelectedDate(prev => (prev === clock.todayDateStr ? newDate : prev));
    setSelectedWeekRefDate(newDate);
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalToday());
  const [selectedWeekRefDate, setSelectedWeekRefDate] = useState<string>(() => getLocalToday());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [theme, setThemeState] = useState<Theme>('light');

  // Load settings and default DB state
  useEffect(() => {
    async function load() {
      await initializeDatabaseDefaults();
      const storedSettings = await db.settings.toArray();
      if (storedSettings.length > 0) {
        const loaded: any = { ...DEFAULT_SETTINGS };
        for (const item of storedSettings) {
          loaded[item.key] = item.value;
        }
        setSettings(loaded);
        if (loaded.theme) {
          setThemeState(loaded.theme);
        }
      }
    }
    load();
  }, []);

  // Sync theme with DOM attribute
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (t === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    for (const [key, value] of Object.entries(newSettings)) {
      await db.settings.put({ key, value });
    }
    if (newSettings.theme) {
      setTheme(newSettings.theme);
    }
  }, [settings, setTheme]);

  const jumpToToday = useCallback(() => {
    const today = getLocalToday();
    setSelectedDate(today);
    setSelectedWeekRefDate(today);
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedWeekRefDate,
        setSelectedWeekRefDate,
        jumpToToday,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        settings,
        updateSettings,
        theme,
        setTheme,
        todayDateStr: clock.todayDateStr,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
