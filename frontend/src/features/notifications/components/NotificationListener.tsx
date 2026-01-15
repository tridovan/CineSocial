import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { notificationService } from '../services/notificationService';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationResponse } from '../types';
import toast from 'react-hot-toast';

export const NotificationListener = () => {
    const { token } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        console.log("NotificationListener: Effect running. Token:", token ? "Present" : "Missing");
        if (!token) return;

        console.log("NotificationListener: Subscribing to SSE...");
        const eventSource = notificationService.subscribe(token);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log("Global SSE Connection established");
        };

        const handleMessage = (event: MessageEvent) => {
            try {
                console.log('Received SSE event:', event.data);
                const newNotification = JSON.parse(event.data) as NotificationResponse;
                addNotification(newNotification);
                toast('New notification: ' + newNotification.message, { icon: '🔔' });
            } catch (e) {
                console.error('Error parsing SSE event', e);
            }
        };

        eventSource.onmessage = handleMessage;
        eventSource.addEventListener('notification', handleMessage as EventListener);

        eventSource.onerror = (err) => {
            console.error('SSE Error', err);
        };

        return () => {
            eventSource.removeEventListener('notification', handleMessage as EventListener);
            eventSource.close();
        };
    }, [token, addNotification]);

    return null; // This component handles side effects only
};
