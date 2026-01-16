import api from '@/lib/axios';
import type { ApiResponseMediaResponse } from '../types';

export const mediaService = {
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ApiResponseMediaResponse>('/media/api/v1/media/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data; // Returns { url, type }
    },
    uploadVideo: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ApiResponseMediaResponse>('/media/api/v1/media/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data; // Returns { url, type }
    }
};
