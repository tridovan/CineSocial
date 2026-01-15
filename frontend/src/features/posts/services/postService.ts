import api from '@/lib/axios';

export const postService = {
    getPosts: async (page = 1) => {
        const response = await api.get(`/posts?page=${page}`);
        return response.data;
    },
    createPost: async (data: any) => {
        const response = await api.post('/posts', data);
        return response.data;
    },
    likePost: async (postId: string) => {
        const response = await api.post(`/posts/${postId}/like`);
        return response.data;
    }
};
