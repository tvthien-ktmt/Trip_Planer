import { create } from 'zustand';
import { Tour } from '../types';

interface CompareState {
  tours: Tour[];
  isCompareModalOpen: boolean;
  addTour: (tour: Tour) => void;
  removeTour: (tourId: string) => void;
  clearCompare: () => void;
  setCompareModalOpen: (isOpen: boolean) => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  tours: [],
  isCompareModalOpen: false,
  addTour: (tour) =>
    set((state) => {
      if (state.tours.find((t) => t.id === tour.id)) return state;
      if (state.tours.length >= 3) return state;
      return { tours: [...state.tours, tour] };
    }),
  removeTour: (tourId) =>
    set((state) => ({
      tours: state.tours.filter((t) => t.id !== tourId),
    })),
  clearCompare: () => set({ tours: [] }),
  setCompareModalOpen: (isOpen) => set({ isCompareModalOpen: isOpen }),
}));
