import { create } from 'zustand';
import { BookingPax } from '../types';

interface SearchState {
  keyword: string;
  location: string;
  dateRange: { from: Date | null; to: Date | null };
  pax: BookingPax;
  setKeyword: (kw: string) => void;
  setLocation: (loc: string) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  setPax: (pax: Partial<BookingPax>) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  location: '',
  dateRange: { from: null, to: null },
  pax: { adults: 1, children: 0, infants: 0 },
  setKeyword: (keyword) => set({ keyword }),
  setLocation: (location) => set({ location }),
  setDateRange: (dateRange) => set({ dateRange }),
  setPax: (pax) => set((state) => ({ pax: { ...state.pax, ...pax } })),
}));
