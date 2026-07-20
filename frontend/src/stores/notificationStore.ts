import { create } from 'zustand';

interface Notification {
  id: string | number;
  title: string;
  body: string;
  type: string;
  readAt?: string | null;
}

interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string | number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    { id: 1, type: "PROMOTION", title: "Ưu đãi 20% Tour Đà Lạt", body: "Áp dụng cho booking nhóm 4 người trở lên." },
    { id: 2, type: "SYSTEM", title: "Booking #TRIP123 thành công", body: "Cảm ơn bạn đã đặt tour. Vui lòng kiểm tra email." }
  ],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
  })),
}));
