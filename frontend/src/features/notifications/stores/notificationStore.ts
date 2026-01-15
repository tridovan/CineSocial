import { create } from 'zustand';
import type { NotificationResponse } from '../types';

interface NotificationStore {
    notifications: NotificationResponse[];
    setNotifications: (notifications: NotificationResponse[]) => void;
    addNotification: (notification: NotificationResponse) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
    })),
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        ),
    })),
    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
