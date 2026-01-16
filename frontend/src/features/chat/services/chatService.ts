import api from '@/lib/axios';
import type {
    ChatRoomRequest,
    ApiResponseChatRoomResponse,
    ApiResponseListChatRoomResponse,
    ApiResponseChatRoomResponseDetail,
    ApiResponsePageResponseListChatMessageResponse
} from '../types';

const BASE_URL = '/chat/api/v1';

export const chatService = {
    // Get all rooms for current user
    getUserChatRooms: async () => {
        const response = await api.get<ApiResponseListChatRoomResponse>(`${BASE_URL}/rooms`);
        return response.data;
    },

    // Create a new room (Group or 1-on-1)
    createChatRoom: async (data: ChatRoomRequest) => {
        const response = await api.post<ApiResponseChatRoomResponse>(`${BASE_URL}/rooms`, data);
        return response.data;
    },

    // Get details of a specific room
    getChatRoomDetail: async (id: string) => {
        const response = await api.get<ApiResponseChatRoomResponseDetail>(`${BASE_URL}/rooms/${id}`);
        return response.data;
    },

    // Update room info
    updateChatRoom: async (id: string, data: ChatRoomRequest) => {
        const response = await api.put<ApiResponseChatRoomResponse>(`${BASE_URL}/rooms/${id}`, data);
        return response.data;
    },

    // Get message history
    getChatHistory: async (roomId: string, page: number = 0, size: number = 20) => {
        const response = await api.get<ApiResponsePageResponseListChatMessageResponse>(`${BASE_URL}/rooms/history/${roomId}`, {
            params: {
                page,
                size
            }
        });
        return response.data;
    },

    // Leave chat room
    leaveChatRoom: async (roomId: string) => {
        const response = await api.patch(`${BASE_URL}/rooms/${roomId}/leave`);
        return response.data;
    }
};
