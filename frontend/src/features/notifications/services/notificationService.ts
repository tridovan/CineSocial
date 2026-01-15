import api from '@/lib/axios';

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markAsRead: async (id: string) => {
        await api.put(`/notifications/${id}/read`);
    }
};
