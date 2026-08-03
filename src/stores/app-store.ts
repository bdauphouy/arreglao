import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '../lib/storage';

type Theme = 'light' | 'dark' | 'system';

type AppState = {
  theme: Theme;
  hasCompletedOnboarding: boolean;
  setTheme: (theme: Theme) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      hasCompletedOnboarding: false,
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
