import api from '@/lib/axios';

export const searchService = {
    search: async (query: string) => {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    }
};
