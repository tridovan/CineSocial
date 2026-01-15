import api from '@/lib/axios';
import type { AuthenticationRequest, UserCreationRequest, ApiResponseAuthenticationResponse, ApiResponseUserResponse } from '../types';

export const authService = {
    login: async (credentials: AuthenticationRequest) => {
        const response = await api.post<ApiResponseAuthenticationResponse>('/identity/api/v1/auth/token', credentials);
        return response.data;
    },
    register: async (data: UserCreationRequest) => {
        const response = await api.post<ApiResponseUserResponse>('/identity/api/v1/auth/register', data);
        return response.data;
    },
    logout: async () => {
        // Optional: Call API to invalidate token if backend requires it
        // For JWT usually client-side removal is enough unless using blacklist
    },
    outboundAuthentication: async (code: string) => {
        const response = await api.post<ApiResponseAuthenticationResponse>('/identity/api/v1/auth/outbound/authentication', null, {
            params: { code }
        });
        return response.data;
    }
};
