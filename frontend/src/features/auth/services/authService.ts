import api from '@/lib/axios';

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    logout: async () => {
        // Optional: Call API to invalidate token if backend requires it
    }
};
