import { useEffect, useRef, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessageResponse } from '../types';

interface ChatMessageRequest {
    content: string;
    contentImgUrl?: string | null;
}

interface UseChatWebSocketProps {
    token: string | null;
    onMessageReceived: (message: ChatMessageResponse) => void;
}

export const useChatWebSocket = ({ token, onMessageReceived }: UseChatWebSocketProps) => {
    const clientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<Map<string, any>>(new Map());

    useEffect(() => {
        if (!token) return;

        // MATCHING USER'S LOGIC:
        // 1. URL: http://localhost:8080/chat/api/v1/ws (Http for SockJS)
        // 2. Token: Appended to URL params
        const socketUrl = `http://localhost:8084/chat/api/v1/ws?token=${token}`;

        const client = new Client({
            // Use SockJS factory
            webSocketFactory: () => new SockJS(socketUrl),

            // Debugging
            debug: (str) => {
                console.log('STOMP: ' + str);
            },

            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                console.log('✅ STOMP Connected via SockJS');
            },
            onStompError: (frame) => {
                console.error('❌ Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            console.log('Deactivating STOMP client...');
            client.deactivate();
            subscriptionsRef.current.clear();
        };
    }, [token]);

    const onMessageReceivedRef = useRef(onMessageReceived);

    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    const subscribeToRoom = useCallback((roomId: string) => {
        if (!clientRef.current || !clientRef.current.connected) {
            console.warn('Cannot subscribe, client not connected');
            return;
        }

        if (subscriptionsRef.current.has(roomId)) {
            return; // Already subscribed
        }

        // Logic: Subscribe to user-specific queue for this room
        // Backend config enables /user broker. 
        // Destination: /user/queue/room/{roomId}
        console.log(`Subscribing to /user/queue/room/${roomId}`);
        const sub = clientRef.current.subscribe(`/user/queue/room/${roomId}`, (message: IMessage) => {
            try {
                const body = JSON.parse(message.body) as ChatMessageResponse;
                onMessageReceivedRef.current(body);
            } catch (e) {
                console.error('Failed to parse message body', e);
            }
        });

        subscriptionsRef.current.set(roomId, sub);
    }, []);

    const unsubscribeFromRoom = useCallback((roomId: string) => {
        const sub = subscriptionsRef.current.get(roomId);
        if (sub) {
            sub.unsubscribe();
            subscriptionsRef.current.delete(roomId);
        }
    }, []);

    const sendGroupMessage = useCallback((roomId: string, message: string, imgUrl?: string) => {
        if (!clientRef.current || !clientRef.current.connected) return;

        const payload: ChatMessageRequest = {
            content: message,
            contentImgUrl: imgUrl || null
        };

        // Destination: /app/chat/room/{roomId}
        clientRef.current.publish({
            destination: `/app/chat/room/${roomId}`,
            body: JSON.stringify(payload)
        });
    }, []);

    const sendPrivateMessage = useCallback((recipientId: string, message: string, imgUrl?: string) => {
        if (!clientRef.current || !clientRef.current.connected) return;

        const payload: ChatMessageRequest = {
            content: message,
            contentImgUrl: imgUrl || null
        };

        // Destination: /app/chat/private/{recipientId}
        clientRef.current.publish({
            destination: `/app/chat/private/${recipientId}`,
            body: JSON.stringify(payload)
        });
    }, []);

    return {
        subscribeToRoom,
        unsubscribeFromRoom,
        sendGroupMessage,
        sendPrivateMessage,
        isConnected: clientRef.current?.connected ?? false
    };
};
