import { create } from 'zustand';
import { api } from '../lib/api';

interface Notification {
  id: string | number;
  title: string;
  body: string;
  type: string;
  readAt?: string | null;
}

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string | number) => void;
  fetchNotifications: () => Promise<void>;
}

// R5-FE-015 fix: Remove hardcoded mock notifications, add fetchNotifications action
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isLoading: false,
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
  })),
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      set({ notifications: res.data?.data || res.data || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
