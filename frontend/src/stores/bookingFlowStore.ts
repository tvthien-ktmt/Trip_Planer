import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PassengerInfo } from '../types';

interface BookingFlowState {
  currentStep: number;
  selectedOutboundFlightId: string | null;
  selectedReturnFlightId: string | null;
  outboundFareClass: string | null;
  returnFareClass: string | null;
  selectedFlightPricing: number | null;
  selectedSeats: Record<string, string>; // passengerId -> seatId
  baggage: Record<string, number>; // passengerId -> weight
  meals: Record<string, string>; // passengerId -> mealType
  addons: string[];
  passengerInfo: PassengerInfo[];
  bookingCode: string | null;
  setStep: (step: number) => void;
  updateBookingData: (data: Partial<BookingFlowState>) => void;
  resetBooking: () => void;
  submitBooking: (totalAmount: number, paymentMethod?: string) => Promise<{ success: boolean; bookingId?: string; error?: any; paymentUrl?: string; paymentId?: string; expiredAt?: Date }>;
  isLoading?: boolean;
  error?: string | null;
}

const initialState = {
  currentStep: 1,
  selectedOutboundFlightId: null,
  selectedReturnFlightId: null,
  outboundFareClass: null,
  returnFareClass: null,
  selectedFlightPricing: null,
  selectedSeats: {},
  baggage: {},
  meals: {},
  addons: [],
  passengerInfo: [],
  bookingCode: null,
};

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      updateBookingData: (data) => set((state) => ({ ...state, ...data })),
      resetBooking: () => set(initialState),
      submitBooking: async (totalAmount: number, paymentMethod: string = 'card') => {
        set({ isLoading: true, error: null });
        try {
          const state = get();
          const { bookingApi } = await import('../lib/api');
          
          // 1. Create Draft Booking
          const draftRes = await bookingApi.createDraftBooking({
            type: 'FLIGHT',
            typeId: state.selectedOutboundFlightId!,
            pax: { adults: state.passengerInfo.length, children: 0, infants: 0 },
            totalAmount,
          });
          const bookingId = draftRes.data.id;

          // 2. Add Passengers
          await bookingApi.addPassengers(bookingId, {
            passengers: state.passengerInfo,
          });

          // 3. Initiate Payment
          const { paymentApi } = await import('../lib/api');
          if (paymentMethod === 'atm' || paymentMethod === 'sepay') {
            const paymentRes = await paymentApi.initiateSepay(bookingId);
            set({ bookingCode: bookingId, isLoading: false, currentStep: 4 });
            return { 
              success: true, 
              bookingId, 
              paymentUrl: paymentRes.data?.paymentUrl,
              paymentId: paymentRes.data?.paymentId,
              expiredAt: paymentRes.data?.expiredAt
            };
          } else {
            const paymentRes = await paymentApi.initiatePayment(bookingId);
            set({ bookingCode: bookingId, isLoading: false, currentStep: 4 });
            return { success: true, bookingId, paymentUrl: paymentRes.data?.paymentUrl };
          }
        } catch (error: any) {
          console.error(error);
          set({ isLoading: false, error: error.message || 'Lỗi đặt vé hoặc khởi tạo thanh toán' });
          return { success: false, error };
        }
      },
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
