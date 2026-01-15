import type { UserResponse } from '../../users/types';

export interface CommentRequest {
    content: string;
    imgUrl?: string;
    parenCommentId?: string | null; // ID of parent comment if this is a reply
}

export interface CommentResponse {
    id: string;
    content: string;
    imgUrl?: string;
    parenCommentId?: string;
    replyCount: number;
    voteCount: number;
    userVoteValue: number;
    createdAt: string;
    updatedAt: string;
    authorProfile: UserResponse;
    replyToUserProfile?: UserResponse;
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
