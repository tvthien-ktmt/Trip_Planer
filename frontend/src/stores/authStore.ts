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
  hydrateFromCookie: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoginModalOpen: false,
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoginModalOpen: false }),
      logout: () => {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      hydrateFromCookie: async () => {
        if (!get().token && typeof window !== 'undefined') {
          try {
            const res = await fetch('/api/auth/refresh', { method: 'POST' });
            if (res.ok) {
              const data = await res.json();
              set({ token: data.access_token, user: data.user, isAuthenticated: true });
              try {
                const { useWishlistStore } = await import('./wishlistStore');
                await useWishlistStore.getState().syncWishlist();
              } catch (e) {}
            } else {
              set({ user: null, token: null, isAuthenticated: false });
            }
          } catch {
            set({ user: null, token: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // FE-S-001 fix: Exclude token from sessionStorage (prevents XSS leak)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
