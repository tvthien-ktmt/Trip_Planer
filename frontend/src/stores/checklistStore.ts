import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChecklistItem } from '../types';

interface ChecklistState {
  items: Record<string, ChecklistItem[]>; // Mapped by tripId or 'default'
  toggleItem: (tripId: string, itemId: string) => void;
  addItem: (tripId: string, item: ChecklistItem) => void;
  removeItem: (tripId: string, itemId: string) => void;
  loadTemplate: (tripId: string, templateItems: Omit<ChecklistItem, 'id' | 'isCompleted'>[]) => void;
  clearChecklist: (tripId: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set) => ({
      items: {},
      toggleItem: (tripId, itemId) =>
        set((state) => {
          const tripItems = state.items[tripId] || [];
          return {
            items: {
              ...state.items,
              [tripId]: tripItems.map((item) =>
                item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
              ),
            },
          };
        }),
      addItem: (tripId, item) =>
        set((state) => ({
          items: {
            ...state.items,
            [tripId]: [...(state.items[tripId] || []), item],
          },
        })),
      removeItem: (tripId, itemId) =>
        set((state) => ({
          items: {
            ...state.items,
            [tripId]: (state.items[tripId] || []).filter((i) => i.id !== itemId),
          },
        })),
      loadTemplate: (tripId, templateItems) =>
        set((state) => {
          const newItems = templateItems.map((ti, index) => ({
            ...ti,
            id: `tpl-${crypto.randomUUID()}-${index}`,
            isCompleted: false,
          }));
          return {
            items: {
              ...state.items,
              [tripId]: [...(state.items[tripId] || []), ...newItems],
            },
          };
        }),
      clearChecklist: (tripId) =>
        set((state) => ({
          items: { ...state.items, [tripId]: [] },
        })),
      isSidebarOpen: false,
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: 'checklist-storage',
    }
  )
);
