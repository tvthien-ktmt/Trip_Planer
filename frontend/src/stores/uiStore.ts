import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  currency: 'VND' | 'USD' | 'EUR';
  toggleTheme: () => void;
  setLanguage: (lang: 'vi' | 'en') => void;
  setCurrency: (curr: 'VND' | 'USD' | 'EUR') => void;
}

// Helper to apply theme class on DOM (safe for SSR)
const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'vi',
      currency: 'VND',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        // FE-S-017 fix: Apply class to document.documentElement
        applyTheme(newTheme);
        set({ theme: newTheme });
      },
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'ui-settings',
      // Re-apply theme class on hydration from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
