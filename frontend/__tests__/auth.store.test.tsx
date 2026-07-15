import { useAuthStore } from '../src/stores/authStore';
import { act } from '@testing-library/react';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoginModalOpen: false });
  });

  it('should initialize with default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoginModalOpen).toBe(false);
  });

  it('should set login modal open', () => {
    act(() => {
      useAuthStore.getState().setLoginModalOpen(true);
    });
    expect(useAuthStore.getState().isLoginModalOpen).toBe(true);
  });

  it('should login correctly', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'USER' };
    
    act(() => {
      useAuthStore.getState().login(mockUser);
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it('should logout correctly', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'USER' };
    
    act(() => {
      useAuthStore.getState().login(mockUser);
    });
    
    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
