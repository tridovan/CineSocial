import type { UserResponse } from '../../users/types';

export interface CommentRequest {
    content: string;
    imgUrl?: string; // Optional image
    parenCommentId?: string; // If replying to a comment
}

export interface CommentResponse {
    id: string;
    content: string;
    imgUrl?: string; // Optional image
    parenCommentId?: string;
    replyCount: number;
    voteCount: number;
    userVoteValue: number; // 1, 0, -1
    createdAt: string;
    updatedAt: string;
    authorProfile: UserResponse;
    replyToUserProfile?: UserResponse; // User being replied to
}

export interface PageResponse<T> {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
    sortBy: string[];
    items: T[];
}

export interface ApiResponseCommentResponse {
    code: number;
    message: string;
    data: CommentResponse;
}

export interface ApiResponsePageResponseListCommentResponse {
    code: number;
    message: string;
    data: PageResponse<CommentResponse>;
}

export interface ApiResponseString {
    code: number;
    message: string;
    data: string;
}
