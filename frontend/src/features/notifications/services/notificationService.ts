import api from '@/lib/axios';
// @ts-ignore
import { EventSourcePolyfill } from 'event-source-polyfill';
import type { ApiResponseListNotificationResponse, ApiResponseString } from '../types/index';

const BASE_URL = '/notification/api/v1/notifications';

export const notificationService = {
    subscribe: (token: string) => {
        const url = `http://localhost:8080${BASE_URL}/subscribe`;
        return new EventSourcePolyfill(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            heartbeatTimeout: 120000 // 2 minutes
        }) as unknown as EventSource;
    },

    getNotifications: async () => {
        const response = await api.get<ApiResponseListNotificationResponse>(BASE_URL);
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.patch<ApiResponseString>(`${BASE_URL}/${id}`);
        return response.data;
    }
};
