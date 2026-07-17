import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PassengerInfo } from '../types';

interface BookingFlowState {
  currentStep: number;
  selectedOutboundFlightId: string | null;
  selectedReturnFlightId: string | null;
  outboundFareClass: string | null;
  returnFareClass: string | null;
  selectedSeats: Record<string, string>; // passengerId -> seatId
  baggage: Record<string, number>; // passengerId -> weight
  meals: Record<string, string>; // passengerId -> mealType
  addons: string[];
  passengerInfo: PassengerInfo[];
  setStep: (step: number) => void;
  updateBookingData: (data: Partial<BookingFlowState>) => void;
  resetBooking: () => void;
}

const initialState = {
  currentStep: 1,
  selectedOutboundFlightId: null,
  selectedReturnFlightId: null,
  outboundFareClass: null,
  returnFareClass: null,
  selectedSeats: {},
  baggage: {},
  meals: {},
  addons: [],
  passengerInfo: [],
};

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      updateBookingData: (data) => set((state) => ({ ...state, ...data })),
      resetBooking: () => set(initialState),
    }),
    {
      name: 'booking-flow-storage',
      // FE-007 fix: Exclude passengerInfo from localStorage (PII protection)
      partialize: (state) => {
        const { passengerInfo, ...rest } = state;
        return rest;
      },
    }
  )
);
