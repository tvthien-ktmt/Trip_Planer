import { create } from 'zustand';

interface WishlistState {
  tourIds: string[];
  destinationIds: string[];
  toggleTour: (id: string) => void;
  toggleDestination: (id: string) => void;
  clearWishlist: () => void;
  syncWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()((set) => ({
  tourIds: [],
  destinationIds: [],
  syncWishlist: async () => {
    try {
      const { api } = await import('../lib/api');
      const res = await api.get('/wishlists');
      const tourIds = res.data.filter((item: any) => item.itemType === 'TOUR').map((item: any) => item.itemId.toString());
      const destinationIds = res.data.filter((item: any) => item.itemType === 'DESTINATION').map((item: any) => item.itemId.toString());
      set({ tourIds, destinationIds });
    } catch (error) {
      console.error('Failed to sync wishlist', error);
    }
  },
  toggleTour: async (id) => {
    set((state) => ({
      tourIds: state.tourIds.includes(id)
        ? state.tourIds.filter((tId) => tId !== id)
        : [...state.tourIds, id],
    }));
    try {
      const { api } = await import('../lib/api');
      await api.post('/wishlists/toggle', { itemType: 'TOUR', itemId: id });
    } catch (error) {
      console.error(error);
    }
  },
  toggleDestination: async (id) => {
    set((state) => ({
      destinationIds: state.destinationIds.includes(id)
        ? state.destinationIds.filter((dId) => dId !== id)
        : [...state.destinationIds, id],
    }));
    try {
      const { api } = await import('../lib/api');
      await api.post('/wishlists/toggle', { itemType: 'DESTINATION', itemId: id });
    } catch (error) {
      console.error(error);
    }
  },
  clearWishlist: () => set({ tourIds: [], destinationIds: [] }),
}));
