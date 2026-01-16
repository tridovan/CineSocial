import type { PageResponse } from '@/features/posts/types';

export interface PostDocument {
    id: string;
    title?: string;
    content: string;
    resourceUrl?: string;
    authorAvatar?: string;
    resourceType: string;
    authorId: string;
    authorName: string;
    voteCount: number;
    commentCount: number;
    createdAt: string;
}

export interface ApiResponsePageResponseListPostDocument {
    code: number;
    message: string;
    data: PageResponse<PostDocument>;
}
export interface ApiResponseListString {
    code: number;
    message: string;
    data: string[];
}
