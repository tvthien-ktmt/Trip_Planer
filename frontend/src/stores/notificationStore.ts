import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: number;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notif) => set((state) => ({
    notifications: [
      {
        ...notif,
        id: `notif-${Date.now()}`,
        isRead: false,
        createdAt: Date.now(),
      },
      ...state.notifications,
    ],
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    ),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
  })),
  clearAll: () => set({ notifications: [] }),
}));
