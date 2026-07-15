import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  tourIds: string[];
  destinationIds: string[];
  toggleTour: (id: string) => void;
  toggleDestination: (id: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      tourIds: [],
      destinationIds: [],
      toggleTour: (id) =>
        set((state) => ({
          tourIds: state.tourIds.includes(id)
            ? state.tourIds.filter((tId) => tId !== id)
            : [...state.tourIds, id],
        })),
      toggleDestination: (id) =>
        set((state) => ({
          destinationIds: state.destinationIds.includes(id)
            ? state.destinationIds.filter((dId) => dId !== id)
            : [...state.destinationIds, id],
        })),
      clearWishlist: () => set({ tourIds: [], destinationIds: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
