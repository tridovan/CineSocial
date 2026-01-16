import type { UserResponse } from '@/features/users/types';
export type { UserResponse };

export interface ChatRoomRequest {
    chatName: string | null;
    imgUrl?: string;
    memberIds: string[];
}

export interface ChatRoomResponse {
    id: string;
    chatName: string;
    type: string; // 'GROUP' or 'PRIVATE' likely
    imgUrl?: string;
}

export interface ChatRoomResponseDetail extends ChatRoomResponse {
    memberIds: string[];
    members: UserResponse[];
}

export interface ChatMessageResponse {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    contentImgUrl?: string;
    timestamp: string;
    sendFirstName: string;
    sendLastName: string;
    senderAvatar?: string;
    recipientIds: string[];
}

export interface ApiResponseChatRoomResponse {
    code: number;
    message: string;
    data: ChatRoomResponse;
}

export interface ApiResponseListChatRoomResponse {
    code: number;
    message: string;
    data: ChatRoomResponse[];
}

export interface ApiResponseChatRoomResponseDetail {
    code: number;
    message: string;
    data: ChatRoomResponseDetail;
}

export interface PageResponseListChatMessageResponse {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
    sortBy: string[];
    items: ChatMessageResponse[];
}

export interface ApiResponsePageResponseListChatMessageResponse {
    code: number;
    message: string;
    data: PageResponseListChatMessageResponse;
}
