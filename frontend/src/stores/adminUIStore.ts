import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUIState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAdminUIStore = create<AdminUIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: 'admin-ui-storage',
    }
  )
);
