import api from '@/lib/axios';

export const userService = {
    getProfile: async (userId: string) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },
    followUser: async (userId: string) => {
        const response = await api.post(`/users/${userId}/follow`);
        return response.data;
    },
    unfollowUser: async (userId: string) => {
        const response = await api.delete(`/users/${userId}/follow`);
        return response.data;
    }
};
