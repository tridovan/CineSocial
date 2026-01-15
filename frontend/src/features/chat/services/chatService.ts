import api from '@/lib/axios';

export const chatService = {
    getHistory: async (userId: string) => {
        const response = await api.get(`/chat/history/${userId}`);
        return response.data;
    },
    sendMessage: async (recipientId: string, content: string) => {
        const response = await api.post('/chat/send', { recipientId, content });
        return response.data;
    }
};
