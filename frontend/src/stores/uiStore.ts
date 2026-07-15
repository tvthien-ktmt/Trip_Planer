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

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'vi',
      currency: 'VND',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'ui-settings',
    }
  )
);
