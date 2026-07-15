import { useBookingCartStore } from '../src/stores/bookingCartStore';
import { act } from '@testing-library/react';

describe('useBookingCartStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useBookingCartStore.setState({ items: [] });
  });

  it('should initialize with empty cart', () => {
    const state = useBookingCartStore.getState();
    expect(state.items).toEqual([]);
  });

  it('should add item to cart', () => {
    const mockItem = {
      id: 'item-1',
      tourId: 'tour-1',
      tourTitle: 'Flight SGN to HAN',
      tourImage: '',
      date: '2026-07-20',
      pax: { adults: 1, children: 0, infants: 0 },
      pricePerAdult: 1500000,
      pricePerChild: 0,
      totalPrice: 1500000
    };
    
    act(() => {
      useBookingCartStore.getState().addItem(mockItem);
    });

    const state = useBookingCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(mockItem);
  });

  it('should calculate total correctly', () => {
    act(() => {
      useBookingCartStore.getState().addItem({
        id: 'item-1',
        tourId: 'tour-1',
        tourTitle: 'Flight SGN to HAN',
        tourImage: '',
        date: '2026-07-20',
        pax: { adults: 2, children: 0, infants: 0 },
        pricePerAdult: 1000000,
        pricePerChild: 0,
        totalPrice: 2000000
      });
      useBookingCartStore.getState().addItem({
        id: 'item-2',
        tourId: 'tour-2',
        tourTitle: 'Tour Da Lat',
        tourImage: '',
        date: '2026-07-25',
        pax: { adults: 1, children: 0, infants: 0 },
        pricePerAdult: 500000,
        pricePerChild: 0,
        totalPrice: 500000
      });
    });

    const total = useBookingCartStore.getState().getTotal();
    expect(total).toBe(2500000);
  });
});
