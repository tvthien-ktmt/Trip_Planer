import { create } from 'zustand';
import { BookingPax } from '../types';

export interface CartItem {
  id: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  date: string;
  pax: BookingPax;
  pricePerAdult: number;
  pricePerChild: number;
  totalPrice: number;
}

interface BookingCartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useBookingCartStore = create<BookingCartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + item.totalPrice, 0),
}));
