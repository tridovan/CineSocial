import api from '@/lib/axios';
import type {
    ApiResponseUserResponse,
    ApiResponseVoid,
    ApiResponseUserWallProfileResponse,
    ApiResponseListUserWallProfileResponse,
    UserUpdateRequest,
    ApiResponseListUserResponse
} from '../types';

export const userService = {
    getMyInfo: async () => {
        const response = await api.get<ApiResponseUserResponse>('/identity/api/v1/users/me');
        return response.data;
    },
    getUserProfile: async (id: string) => {
        const response = await api.get<ApiResponseUserResponse>(`/identity/api/v1/users/${id}`);
        return response.data;
    },
    updateProfile: async (id: string, data: UserUpdateRequest) => {
        const response = await api.put<ApiResponseUserResponse>(`/identity/api/v1/users/${id}`, data);
        return response.data;
    },
    getUserWall: async (id: string) => {
        const response = await api.get<ApiResponseUserWallProfileResponse>(`/identity/api/v1/users/${id}/wall`);
        return response.data;
    },
    searchUsers: async (keyword: string) => {
        const response = await api.get<ApiResponseListUserWallProfileResponse>('/identity/api/v1/users/search', {
            params: { keyword }
        });
        return response.data;
    },
    followUser: async (id: string) => {
        const response = await api.post<ApiResponseVoid>(`/identity/api/v1/users/${id}/follow`);
        return response.data;
    },
    unfollowUser: async (id: string) => {
        const response = await api.post<ApiResponseVoid>(`/identity/api/v1/users/${id}/unfollow`);
        return response.data;
    },
    getMyFollowedUsers: async () => {
        const response = await api.get<ApiResponseListUserResponse>('/identity/api/v1/users/me/following');
        return response.data;
    }
};
