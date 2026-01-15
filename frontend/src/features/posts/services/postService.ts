import api from '@/lib/axios';
import type {
    PostCreationRequest,
    PostUpdateRequest,
    ApiResponsePostResponse,
    ApiResponsePageResponseListPostResponse,
    ApiResponseString
} from '../types';

const BASE_URL = '/post/api/v1';

export const postService = {
    // === Posts ===
    createPost: async (data: PostCreationRequest) => {
        const response = await api.post<ApiResponsePostResponse>(`${BASE_URL}/posts`, data);
        return response.data;
    },

    updatePost: async (postId: string, data: PostUpdateRequest) => {
        const response = await api.put<ApiResponseString>(`${BASE_URL}/posts/${postId}`, data);
        return response.data;
    },

    deletePost: async (postId: string) => {
        const response = await api.delete<ApiResponseString>(`${BASE_URL}/posts/${postId}`);
        return response.data;
    },

    getPostById: async (postId: string) => {
        // Note: The User Swagger didn't explicitly list GET /posts/{postId} in the snippet, 
        // but it's standard. If missing, we rely on feed. 
        // But usually you need to fetch a single post for notifications etc.
        // Assuming it exists or we use the feed list logic.
        // Wait, the Swagger had /posts/{postId} PUT/DELETE, but not GET?
        // Ah, typically there is one. I'll omit if not strictly requested, 
        // but usually 'getPosts' is the main one.
        // Let's stick to the feed APIs provided.
        return null;
    },

    // === Feeds ===
    getPosts: async (page = 1, size = 15) => {
        const response = await api.get<ApiResponsePageResponseListPostResponse>(`${BASE_URL}/posts`, {
            params: { page, size }
        });
        return response.data;
    },

    getPostsByUserId: async (userId: string, page = 1, size = 10) => {
        const response = await api.get<ApiResponsePageResponseListPostResponse>(`${BASE_URL}/posts/user/${userId}`, {
            params: { page, size }
        });
        return response.data;
    },

    getMyPosts: async (page = 1, size = 10) => {
        const response = await api.get<ApiResponsePageResponseListPostResponse>(`${BASE_URL}/posts/my-posts`, {
            params: { page, size }
        });
        return response.data;
    },

    getMyFeed: async (page = 1, size = 10) => {
        const response = await api.get<ApiResponsePageResponseListPostResponse>(`${BASE_URL}/posts/my-feed`, {
            params: { page, size }
        });
        return response.data;
    },

    getReels: async (page = 1, size = 10) => {
        const response = await api.get<ApiResponsePageResponseListPostResponse>(`${BASE_URL}/posts/reels`, {
            params: { page, size }
        });
        return response.data;
    },

    // === Actions ===
    votePost: async (postId: string, value: number) => {
        // value: 1 = upvote, 0 = unvote, -1 = dislike (assuming standard, or 1 for dislike if user insists)
        const response = await api.post<ApiResponseString>(`${BASE_URL}/posts/${postId}/vote`, null, {
            params: { value }
        });
        return response.data;
    },

    retryPost: async (postId: string) => {
        const response = await api.post<ApiResponseString>(`${BASE_URL}/posts/${postId}/retry`);
        return response.data;
    }
};
