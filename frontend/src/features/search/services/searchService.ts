import api from '@/lib/axios';
import type { ApiResponsePageResponseListPostDocument } from '../types';

const BASE_URL = '/search/api/v1';

export interface SearchParams {
    keyword?: string;
    resourceType?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export const searchService = {
    searchPosts: async (params: SearchParams) => {
        const response = await api.get<ApiResponsePageResponseListPostDocument>(`${BASE_URL}/search/posts`, {
            params: {
                ...params,
                page: params.page || 1,
                size: params.size || 10
            }
        });
        return response.data;
    }
};
