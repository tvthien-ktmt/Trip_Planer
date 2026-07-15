import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchFlightState {
  departure: string;
  destination: string;
  departureDate: string | null;
  returnDate: string | null;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  seatClass: 'Economy' | 'Premium Economy' | 'Business' | 'First Class';
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  setSearch: (data: Partial<SearchFlightState>) => void;
  resetSearch: () => void;
}

const initialState = {
  departure: '',
  destination: '',
  departureDate: null,
  returnDate: null,
  passengers: { adults: 1, children: 0, infants: 0 },
  seatClass: 'Economy' as const,
  tripType: 'round-trip' as const,
};

export const useSearchFlightStore = create<SearchFlightState>()(
  persist(
    (set) => ({
      ...initialState,
      setSearch: (data) => set((state) => ({ ...state, ...data })),
      resetSearch: () => set(initialState),
    }),
    {
      name: 'search-flight-storage',
    }
  )
);
