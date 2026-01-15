import api from '@/lib/axios';

export const mediaService = {
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/media/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.url;
    },
    uploadVideo: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/media/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.url;
    }
};
