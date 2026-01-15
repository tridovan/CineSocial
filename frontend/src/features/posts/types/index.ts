import type { UserResponse } from '../../users/types';

export type ResourceType = 'IMAGE' | 'VIDEO' | 'NONE';

export interface PostCreationRequest {
    title?: string;
    content: string;
    resourceUrl?: string;
    resourceType: ResourceType;
}

export interface PostUpdateRequest {
    title?: string;
    content?: string;
}

export interface PostResponse {
    id: string;
    title?: string;
    content?: string;
    status?: string; // 'MEDIA_FAILED' | 'COMPLETED' etc.
    resourceUrl?: string;
    resourceType: ResourceType;
    commentCount: number;
    voteCount: number;
    userVoteValue: number; // 1, 0, -1
    createdAt: string;
    updatedAt: string;
    userProfile: UserResponse;
}

// Reuse generic API response types? Or define specific ones if they differ.
// Using generics for consistency with userService/mediaService style if possible, 
// but defining specific ones here as per User requests schema references

export interface PageResponse<T> {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
    sortBy: string[];
    items: T[];
}

export interface ApiResponsePostResponse {
    code: number;
    message: string;
    data: PostResponse;
}

export interface ApiResponsePageResponseListPostResponse {
    code: number;
    message: string;
    data: PageResponse<PostResponse>;
}

export interface ApiResponseString {
    code: number;
    message: string;
    data: string;
}
