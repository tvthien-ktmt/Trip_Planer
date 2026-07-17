import { create } from 'zustand';
import { User } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoginModalOpen: (isOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoginModalOpen: false,
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoginModalOpen: false }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // FE-S-001 fix: Exclude token from sessionStorage (prevents XSS leak)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
