import { create } from 'zustand';
import { User } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  _hasHydrated: boolean;
  isHydrating: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoginModalOpen: (isOpen: boolean) => void;
  hydrateFromCookie: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoginModalOpen: false,
      _hasHydrated: false,
      isHydrating: false,
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoginModalOpen: false }),
      logout: () => {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      hydrateFromCookie: async () => {
        if (get().isHydrating) return;
        if (typeof window !== 'undefined' && sessionStorage.getItem('hasAttemptedRefresh')) return;
        if (!get().token && typeof window !== 'undefined') {
          set({ isHydrating: true });
          sessionStorage.setItem('hasAttemptedRefresh', 'true');
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
          } finally {
            set({ isHydrating: false });
          }
        }
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // FE-S-001 fix: Exclude token from sessionStorage (prevents XSS leak)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
