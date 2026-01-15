import { create } from 'zustand';
import type { UserResponse } from '../../users/types';
import { userService } from '../../users/services/userService';

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: UserResponse | null, token: string) => void;
    logout: () => void;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
    fetchProfile: async () => {
        try {
            const response = await userService.getMyInfo();
            if (response && response.data) {
                set({ user: response.data });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    }
}));
