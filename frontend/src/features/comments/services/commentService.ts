import api from '@/lib/axios';
import type {
    CommentRequest,
    ApiResponseCommentResponse,
    ApiResponsePageResponseListCommentResponse,
    ApiResponseString
} from '../types';

const BASE_URL = '/post/api/v1'; // Comments are under the same base URL in the Swagger provided

export const commentService = {
    // === Get Comments ===
    getCommentsOfPost: async (postId: string, page = 1, size = 10) => {
        const response = await api.get<ApiResponsePageResponseListCommentResponse>(`${BASE_URL}/posts/${postId}/comments`, {
            params: { page, size }
        });
        return response.data;
    },

    getReplies: async (commentId: string, page = 0, size = 10) => {
        const response = await api.get<ApiResponsePageResponseListCommentResponse>(`${BASE_URL}/comments/${commentId}/replies`, {
            params: { page, size }
        });
        return response.data;
    },

    // === CRUD ===
    createComment: async (postId: string, data: CommentRequest) => {
        const response = await api.post<ApiResponseCommentResponse>(`${BASE_URL}/posts/${postId}/comments`, data);
        return response.data;
    },

    updateComment: async (commentId: string, content: string) => {
        // Warning: Swagger said request body schema is just "type: string". 
        // Usually JSON expects { "content": "..." } or just "..." string if raw.
        // Assuming JSON wrapper based on standard Spring Boot/API practices unless "text/plain".
        // Swagger says "application/json" -> schema type string.
        // This often means the body usually is just the string, OR a wrapper.
        // I will assume it sends a plain string in quotes, or I might need to wrap it.
        // Safest is often to send as object if the backend uses @RequestBody String content.
        // But let's follow the schema: "type: string".
        const response = await api.put<ApiResponseString>(`${BASE_URL}/comments/${commentId}`, content, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    deleteComment: async (commentId: string) => {
        const response = await api.delete<ApiResponseString>(`${BASE_URL}/comments/${commentId}`);
        return response.data;
    },

    // === Actions ===
    voteComment: async (commentId: string, value: number) => {
        const response = await api.post<ApiResponseString>(`${BASE_URL}/comments/${commentId}/vote`, null, {
            params: { value }
        });
        return response.data;
    }
};
